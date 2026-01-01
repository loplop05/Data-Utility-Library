import pandas as pd

"""
DataUtility Library
-------------------
A small pandas-based toolkit for fast data cleaning and exploration.

Author: Ammar Yaser Al-haroun
Use case: university projects, hackathons, ML preprocessing

Design Rules
------------
- All operations use self.df by default.
- All “transform” methods respect inplace=True/False.
- Column validation everywhere (friendly errors).
- Numeric-only operations validate dtype.
"""


class BaseTools:
    # ==========================================================
    """SECTION: Helpers (Foundation Utilities)"""
    # ==========================================================
    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()

    def _require_columns(self, columns):
        """Validate columns exist. columns can be str or list[str]."""
        if columns is None:
            return
        if isinstance(columns, str):
            columns = [columns]

        missing = [c for c in columns if c not in self.df.columns]
        if missing:
            available = list(self.df.columns)
            raise ValueError(f"Column(s) {missing} not found. Available columns: {available}")

    def _ensure_list(self, columns):
        """Convert a single column name into list; keep list as list."""
        if columns is None:
            return None
        if isinstance(columns, str):
            return [columns]
        return list(columns)

    def _numeric_columns(self, columns=None):
        """
        Return numeric columns (optionally filtered by provided columns).
        Raises TypeError if user requested non-numeric columns.
        """
        if columns is None:
            return list(self.df.select_dtypes(include="number").columns)

        cols = self._ensure_list(columns)
        self._require_columns(cols)

        numeric, non_numeric = [], []
        for c in cols:
            if pd.api.types.is_numeric_dtype(self.df[c]):
                numeric.append(c)
            else:
                non_numeric.append(c)

        if non_numeric:
            raise TypeError(
                f"These columns are not numeric: {non_numeric}. Numeric required for this operation."
            )
        return numeric

    def _apply(self, new_df: pd.DataFrame, inplace: bool):
        """Apply changes according to inplace behavior."""
        if inplace:
            self.df = new_df
            return self.df
        return new_df
