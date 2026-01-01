import pandas as pd


class EncodingTools:
    # ==========================================================
    """SECTION: Encoding (One-Hot + Label Encoding)"""
    # ==========================================================
    def oneHotEncode(self, columns=None, *, drop_first: bool = False, inplace: bool = True):
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
