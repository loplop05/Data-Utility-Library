class TextCleaningTools:
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
    ):
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
