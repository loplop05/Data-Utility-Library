import pandas as pd


class TypeTools:
    # ==========================================================
    """SECTION: Column Type Transformations"""
    # ==========================================================
    def to_int(self, column: str, *, inplace: bool = True):
        """Convert column to int64."""
        self._require_columns(column)
        new_df = self.df.copy()
        new_df[column] = new_df[column].astype("int64")
        return self._apply(new_df, inplace)

    def to_float(self, column: str, *, inplace: bool = True):
        """Convert column to float64."""
        self._require_columns(column)
        new_df = self.df.copy()
        new_df[column] = new_df[column].astype("float64")
        return self._apply(new_df, inplace)

    def to_string(self, column: str, *, inplace: bool = True):
        """Convert column to pandas StringDtype."""
        self._require_columns(column)
        new_df = self.df.copy()
        new_df[column] = new_df[column].astype("string")
        return self._apply(new_df, inplace)

    def to_bool(self, column: str, *, inplace: bool = True):
        """Convert column to bool."""
        self._require_columns(column)
        new_df = self.df.copy()
        new_df[column] = new_df[column].astype("bool")
        return self._apply(new_df, inplace)

    def to_datetime(self, column: str, *, inplace: bool = True):
        """Convert column to datetime (invalid values become NaT)."""
        self._require_columns(column)
        new_df = self.df.copy()
        new_df[column] = pd.to_datetime(new_df[column], errors="coerce")
        return self._apply(new_df, inplace)

    def to_category(self, column: str, *, inplace: bool = True):
        """Convert column to pandas 'category' dtype."""
        self._require_columns(column)
        new_df = self.df.copy()
        new_df[column] = new_df[column].astype("category")
        return self._apply(new_df, inplace)
