class FeatureTools:
    # ==========================================================
    """SECTION: Feature Combination (Equation-based)"""
    # ==========================================================
    def combineFeatures(self, new_col: str, expression: str, *, inplace: bool = True):
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
