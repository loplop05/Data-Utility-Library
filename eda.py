import pandas as pd


class EDATools:
    # ==========================================================
    """SECTION: Inspection / Quick EDA"""
    # ==========================================================
    def insights(self):
        """Return describe() summary (numeric + categorical)."""
        return self.df.describe(include="all").transpose()

    def head(self, n: int = 5):
        """Return first n rows."""
        return self.df.head(n)

    def tail(self, n: int = 5):
        """Return last n rows."""
        return self.df.tail(n)

    def overview(self):
        """
        Quick overview: shape, dtypes, missing %, duplicates, memory.
        Returns:
            summary (dict), info_table (DataFrame)
        """
        info_table = pd.DataFrame({
            "dtype": self.df.dtypes.astype(str),
            "missing_count": self.df.isna().sum(),
            "missing_%": (self.df.isna().mean() * 100).round(2),
            "unique": self.df.nunique(dropna=True)
        }).sort_values("missing_%", ascending=False)

        summary = {
            "rows": int(self.df.shape[0]),
            "cols": int(self.df.shape[1]),
            "duplicates": int(self.df.duplicated().sum()),
            "memory_MB": float(self.df.memory_usage(deep=True).sum() / (1024 ** 2))
        }
        return summary, info_table

    def missingReport(self):
        """Return a table of missing values per column."""
        return pd.DataFrame({
            "missing_count": self.df.isna().sum(),
            "missing_%": (self.df.isna().mean() * 100).round(2),
            "dtype": self.df.dtypes.astype(str)
        }).sort_values("missing_%", ascending=False)
