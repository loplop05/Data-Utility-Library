import numpy as np
import pandas as pd

"""
DataUtility Library
-----------------
A small pandas-based toolkit for fast data cleaning and exploration.

Author: Ammar Yaser Al-haroun

Use case: university projects, hackathons, ML preprocessing

Module Flow: Helpers → Import → EDA → Missing/Duplicates → Outliers → Types.
"""
class DataTools:
    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()

    # =============================
    # Helpers (foundation)
    # =============================
    def _require_columns(self, columns):
        """Validate columns exist. columns can be str or list[str]."""
        if columns is None:
            return
        if isinstance(columns, str):
            columns = [columns]

        missing = [c for c in columns if c not in self.df.columns]
        if missing:
            available = list(self.df.columns)
            raise ValueError(
                f"Column(s) {missing} not found. Available columns: {available}"
            )

    def _ensure_list(self, columns):
        if columns is None:
            return None
        if isinstance(columns, str):
            return [columns]
        return list(columns)

    def _numeric_columns(self, columns=None):
        """Return numeric columns (optionally filtered by provided columns)."""
        if columns is None:
            return list(self.df.select_dtypes(include="number").columns)

        cols = self._ensure_list(columns)
        self._require_columns(cols)

        numeric = []
        non_numeric = []
        for c in cols:
            if pd.api.types.is_numeric_dtype(self.df[c]):
                numeric.append(c)
            else:
                non_numeric.append(c)

        if non_numeric:
            raise TypeError(
                f"These columns are not numeric: {non_numeric}. "
                f"Numeric required for this operation."
            )
        return numeric

    def _apply(self, new_df: pd.DataFrame, inplace: bool):
        """Apply changes according to inplace behavior."""
        if inplace:
            self.df = new_df
            return self.df
        return new_df

    # =============================
    # Import / Load (multi-source)
    # =============================
    def importData(self, source, *, source_type: str = None, **kwargs):
        """
        Load data into self.df from:
        - DataFrame
        - CSV / Excel / JSON / HTML
        - SQL query (requires con=...)

        Examples:
            dt.importData(df)
            dt.importData("data.csv")
            dt.importData("data.xlsx")
            dt.importData("https://site.com/table.html")
            dt.importData("SELECT * FROM users", source_type="sql", con=engine)
        """
        if isinstance(source, pd.DataFrame):
            self.df = source.copy()
            return self.df

        if not isinstance(source, str):
            raise TypeError("source must be a pandas DataFrame or a string (path/url/sql query).")

        # if source_type not provided, auto-detect by extension
        if source_type is None:
            s = source.lower()

            if s.endswith(".csv"):
                self.df = pd.read_csv(source, **kwargs)
            elif s.endswith((".xls", ".xlsx")):
                self.df = pd.read_excel(source, **kwargs)
            elif s.endswith(".json"):
                self.df = pd.read_json(source, **kwargs)
            elif s.endswith((".html", ".htm")):
                self.df = pd.read_html(source, **kwargs)[0]
            else:
                raise ValueError(
                    "Cannot auto-detect file type. "
                    "Provide source_type: 'csv'|'excel'|'json'|'html'|'sql'."
                )
            return self.df

        # manual source_type
        t = source_type.lower()
        if t == "csv":
            self.df = pd.read_csv(source, **kwargs)
        elif t == "excel":
            self.df = pd.read_excel(source, **kwargs)
        elif t == "json":
            self.df = pd.read_json(source, **kwargs)
        elif t == "html":
            self.df = pd.read_html(source, **kwargs)[0]
        elif t == "sql":
            con = kwargs.get("con", None)
            if con is None:
                raise ValueError("SQL import requires con=... (database connection/engine).")
            self.df = pd.read_sql(source, con)
        else:
            raise ValueError(f"Unsupported source_type: {source_type}")

        return self.df

    # =============================
    # Inspection / Quick EDA
    # =============================
    def insights(self):
        return self.df.describe(include="all").transpose()

    def head(self, n: int = 5):
        return self.df.head(n)

    def tail(self, n: int = 5):
        return self.df.tail(n)

    def overview(self):
        """Quick overview: shape, dtypes, missing %, duplicates, memory."""
        missing_pct = (self.df.isna().mean() * 100).round(2)
        dtypes = self.df.dtypes.astype(str)

        info = pd.DataFrame({
            "dtype": dtypes,
            "missing_%": missing_pct,
            "missing_count": self.df.isna().sum(),
            "unique": self.df.nunique(dropna=True)
        })

        summary = {
            "rows": int(self.df.shape[0]),
            "cols": int(self.df.shape[1]),
            "duplicates": int(self.df.duplicated().sum()),
            "memory_MB": float(self.df.memory_usage(deep=True).sum() / (1024**2))
        }
        return summary, info.sort_values("missing_%", ascending=False)

    def missingReport(self):
        """Return a table of missing count/percent per column."""
        return pd.DataFrame({
            "missing_count": self.df.isna().sum(),
            "missing_%": (self.df.isna().mean() * 100).round(2),
            "dtype": self.df.dtypes.astype(str)
        }).sort_values("missing_%", ascending=False)

    # =============================
    # Missing / Duplicates
    # =============================
    def naCount(self, column: str = None):
        if column:
            self._require_columns(column)
            return int(self.df[column].isna().sum())
        return self.df.isna().sum()

    def dropMissingValues(self, *, axis: int = 0, thresh: int = None, columns=None, inplace: bool = True):
        """
        Drop missing values with more control.

        axis:
            0 => drop rows
            1 => drop columns

        thresh:
            minimum number of non-NA values required to keep row/column

        columns:
            only used when axis=0 (rows) to consider missing in a subset of columns
        """
        new_df = self.df.copy()

        if axis not in (0, 1):
            raise ValueError("axis must be 0 (rows) or 1 (columns).")

        if axis == 1:
            # drop columns
            new_df = new_df.dropna(axis=1, thresh=thresh)
            return self._apply(new_df, inplace)

        # axis == 0 (drop rows)
        if columns is None:
            new_df = new_df.dropna(axis=0, thresh=thresh)
        else:
            cols = self._ensure_list(columns)
            self._require_columns(cols)
            # thresh works with subset too
            new_df = new_df.dropna(axis=0, thresh=thresh, subset=cols)

        return self._apply(new_df, inplace)

    def fillMissingValues(self, strategy: str = "mean", *, value=None, columns=None, inplace: bool = True):
        """
        self         → the object
        source       → WHAT to load (required)
          *            → stop positional args here
        source_type  → HOW to interpret it (optional)
        **kwargs     → EXTRA settings (flexible)
        """


        """
        Fill missing values using ONE unified API.

        strategy:
            'mean' | 'median' | 'min' | 'max' | 'mode' | 'value'

        columns:
            None => apply to all numeric columns (for mean/median/min/max),
                    and all columns (for mode/value) depending on strategy.
            str or list[str] => specific columns

        Examples:
            dt.fill_missing("mean")                       # all numeric columns
            dt.fill_missing("median", columns=["age"])    # one column
            dt.fill_missing("mode", columns=["city"])     # categorical
            dt.fill_missing("value", value=0)             # fill all columns with 0
        """
        strategy = strategy.lower()
        new_df = self.df.copy()

        # Decide target columns
        if columns is None:
            target_cols = list(new_df.columns)
        else:
            target_cols = self._ensure_list(columns)
            self._require_columns(target_cols)

        if strategy in ("mean", "median", "min", "max"):
            # numeric only
            num_cols = self._numeric_columns(target_cols)

            if strategy == "mean":
                for c in num_cols:
                    new_df[c] = new_df[c].fillna(new_df[c].mean())
            elif strategy == "median":
                for c in num_cols:
                    new_df[c] = new_df[c].fillna(new_df[c].median())
            elif strategy == "min":
                for c in num_cols:
                    new_df[c] = new_df[c].fillna(new_df[c].min())
            elif strategy == "max":
                for c in num_cols:
                    new_df[c] = new_df[c].fillna(new_df[c].max())

        elif strategy == "mode":
            # mode works for both numeric & categorical
            for c in target_cols:
                mode_vals = new_df[c].mode(dropna=True)
                if len(mode_vals) == 0:
                    continue
                new_df[c] = new_df[c].fillna(mode_vals.iloc[0])

        elif strategy == "value":
            if value is None:
                raise ValueError("strategy='value' requires value=...")
            for c in target_cols:
                new_df[c] = new_df[c].fillna(value)

        else:
            raise ValueError("Invalid strategy. Use: mean|median|min|max|mode|value")

        return self._apply(new_df, inplace)

    # =============================
    """Outliers Detection Methods"""
    # =============================
    def outlier_mask_iqr(self, columns=None, k: float = 1.5) -> pd.Series:
        """
        Return boolean mask of rows that contain outliers using IQR in given numeric columns.
        columns=None => all numeric columns.
        """
        num_cols = self._numeric_columns(columns)

        if len(num_cols) == 0:
            raise TypeError("No numeric columns to detect outliers.")

        numeric_df = self.df[num_cols]
        q1 = numeric_df.quantile(0.25)
        q3 = numeric_df.quantile(0.75)
        iqr = q3 - q1
        lower = q1 - k * iqr
        upper = q3 + k * iqr

        return ((numeric_df < lower) | (numeric_df > upper)).any(axis=1)




    def detect_outliers_iqr(self, columns=None, k: float = 1.5) -> pd.DataFrame:
        """Return rows that are outliers (based on IQR mask)."""
        mask = self.outlier_mask_iqr(columns=columns, k=k)
        return self.df[mask]


    def clip_outliers_iqr(self, columns=None, k: float = 1.5, inplace: bool = True) -> pd.DataFrame:
        """
        Clip numeric columns to IQR bounds (winsorizing-like).
        Useful instead of dropping outliers.
        """
        num_cols = self._numeric_columns(columns)
        new_df = self.df.copy()

        numeric_df = new_df[num_cols]
        q1 = numeric_df.quantile(0.25)
        q3 = numeric_df.quantile(0.75)
        iqr = q3 - q1
        lower = q1 - k * iqr
        upper = q3 + k * iqr
        for c in num_cols:
            new_df[c] = new_df[c].clip(lower[c], upper[c])

        return self._apply(new_df, inplace)


    # ==========================================================
    def outlier_mask_zscore(self, columns=None, *, z: float = 3.0) -> pd.Series:
        """
        Boolean mask for rows containing z-score outliers in numeric columns.
        columns=None => all numeric columns.
        """
        num_cols = self._numeric_columns(columns)
        if len(num_cols) == 0:
            raise TypeError("No numeric columns to detect outliers.")

        df_num = self.df[num_cols].astype(float)
        mean = df_num.mean()
        std = df_num.std(ddof=0)

        std_replaced = std.replace(0, np.nan)
        zscores = (df_num - mean) / std_replaced

        mask = (zscores.abs() > z).any(axis=1).fillna(False)
        return mask

    def detect_outliers_zscore(self, columns=None, *, z: float = 3.0) -> pd.DataFrame:
        """Return rows that contain z-score outliers."""
        mask = self.outlier_mask_zscore(columns=columns, z=z)
        return self.df[mask]

    def clip_outliers_zscore(self, columns=None, *, z: float = 3.0, inplace: bool = True) -> pd.DataFrame:
        """
        Clip numeric columns to mean ± z*std.
        """
        num_cols = self._numeric_columns(columns)
        new_df = self.df.copy()

        df_num = new_df[num_cols].astype(float)
        mean = df_num.mean()
        std = df_num.std(ddof=0)

        lower = mean - z * std
        upper = mean + z * std

        for c in num_cols:
            new_df[c] = new_df[c].clip(lower[c], upper[c])

        return self._apply(new_df, inplace)

    """  --------------------------------------------  """
    """  SECTION: Encoding (One-Hot + Label Encoding)  """
    """  --------------------------------------------  """
    def oneHotEncode(self, columns=None, *, drop_first: bool = False, inplace: bool = True) -> pd.DataFrame:
        """
        One-hot encode categorical columns.
        columns=None => auto-detect object/category columns.
        """
        new_df = self.df.copy()

        if columns is None:
            cols = list(new_df.select_dtypes(include=["object", "category"]).columns)
        else:
            cols = self._ensure_list(columns)
            self._require_columns(cols)

        if len(cols) == 0:
            return self._apply(new_df, inplace)

        new_df = pd.get_dummies(new_df, columns=cols, drop_first=drop_first)
        return self._apply(new_df, inplace)

    def labelEncode(self, column: str, *, inplace: bool = True, return_mapping: bool = False):
        """
        Label encode a single column.
        Keeps NaN as NaN.
        If return_mapping=True returns (df, mapping_dict).
        """
        self._require_columns(column)
        new_df = self.df.copy()

        series = new_df[column].astype("string")
        uniques = sorted([x for x in series.dropna().unique()])

        mapping = {val: i for i, val in enumerate(uniques)}
        new_df[column] = series.map(mapping)

        if return_mapping:
            return (self._apply(new_df, inplace), mapping)
        return self._apply(new_df, inplace)

    # ==========================================================
    """SECTION: Scaling (Standardization + MinMax)"""
    # ==========================================================
    def scale(self, method: str = "standard", *, columns=None, inplace: bool = True) -> pd.DataFrame:
        """
        Scale numeric columns.

        method:
            'standard' => (x - mean) / std
            'minmax'   => (x - min) / (max - min)
        """
        method = method.lower()
        num_cols = self._numeric_columns(columns)

        new_df = self.df.copy()
        for c in num_cols:
            s = new_df[c].astype(float)

            if method == "standard":
                std = s.std(ddof=0)
                if std == 0 or pd.isna(std):
                    continue
                new_df[c] = (s - s.mean()) / std

            elif method == "minmax":
                mn, mx = s.min(), s.max()
                if mn == mx or pd.isna(mn) or pd.isna(mx):
                    continue
                new_df[c] = (s - mn) / (mx - mn)

            else:
                raise ValueError("method must be 'standard' or 'minmax'.")

        return self._apply(new_df, inplace)












    # ==========================================================
    """SECTION: Feature Combination (Equation-based)"""
    # ==========================================================
    def combineFeatures(self, new_col: str, expression: str, *, inplace: bool = True) -> pd.DataFrame:
        """
        Create a new feature column from an expression using existing columns.

        Examples:
            dt.combineFeatures("profit", "revenue - cost")
            dt.combineFeatures("bmi", "weight / (height**2)")
            dt.combineFeatures("full_name", "first + ' ' + last")
        """
        if not isinstance(new_col, str) or not new_col.strip():
            raise ValueError("new_col must be a non-empty string.")
        if not isinstance(expression, str) or not expression.strip():
            raise ValueError("expression must be a non-empty string.")

        new_df = self.df.copy()
        try:
            new_df[new_col] = new_df.eval(expression, engine="python")
        except Exception as e:
            raise ValueError(
                f"Invalid expression or column names.\nExpression: {expression}\nError: {e}"
            )

        return self._apply(new_df, inplace)


    # ==========================================================
    """SECTION: Text Cleaning Helpers"""
    # ==========================================================
    def cleanText(
        self,
        columns,
        *,
        lower: bool = True,
        strip: bool = True,
        remove_punct: bool = False,
        remove_extra_spaces: bool = True,
        inplace: bool = True
    ) -> pd.DataFrame:
        """
        Basic text cleaning for one or more columns.

        Options:
            lower: lowercase text
            strip: strip leading/trailing spaces
            remove_punct: remove punctuation
            remove_extra_spaces: collapse multiple spaces to one
        """
        cols = self._ensure_list(columns)
        self._require_columns(cols)

        new_df = self.df.copy()
        for c in cols:
            s = new_df[c].astype("string")

            if strip:
                s = s.str.strip()
            if lower:
                s = s.str.lower()
            if remove_punct:
                s = s.str.replace(r"[^\w\s]", "", regex=True)
            if remove_extra_spaces:
                s = s.str.replace(r"\s+", " ", regex=True).str.strip()

            new_df[c] = s

        return self._apply(new_df, inplace)












    # =============================
    """    Columns Transformation Types    """
    # =============================
    def to_int(self, column: str, *, inplace: bool = True):
        self._require_columns(column)
        new_df = self.df.copy()
        new_df[column] = new_df[column].astype("int64")
        return self._apply(new_df, inplace)

    def to_float(self, column: str, *, inplace: bool = True):
        self._require_columns(column)
        new_df = self.df.copy()
        new_df[column] = new_df[column].astype("float64")
        return self._apply(new_df, inplace)

    def to_string(self, column: str, *, inplace: bool = True):
        self._require_columns(column)
        new_df = self.df.copy()
        new_df[column] = new_df[column].astype("string")
        return self._apply(new_df, inplace)

    def to_bool(self, column: str, *, inplace: bool = True):
        self._require_columns(column)
        new_df = self.df.copy()
        new_df[column] = new_df[column].astype("bool")
        return self._apply(new_df, inplace)

    def to_datetime(self, column: str, *, inplace: bool = True):
        self._require_columns(column)
        new_df = self.df.copy()
        new_df[column] = pd.to_datetime(new_df[column], errors="coerce")
        return self._apply(new_df, inplace)

    def to_category(self, column: str, *, inplace: bool = True):
        """
        Convert a column to pandas 'category' dtype.
        """
        self._require_columns(column)

        new_df = self.df.copy()
        new_df[column] = new_df[column].astype("category")

        return self._apply(new_df, inplace)
















