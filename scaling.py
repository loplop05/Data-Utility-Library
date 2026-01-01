import pandas as pd


class ScalingTools:
    # ==========================================================
    """SECTION: Scaling (Standardization + MinMax)"""
    # ==========================================================
    def scale(self, method: str = "standard", *, columns=None, inplace: bool = True):
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
