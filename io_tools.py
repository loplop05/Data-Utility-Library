import pandas as pd


class IOTools:
    # ==========================================================
    """SECTION: Import / Load (Multi-Source)"""
    # ==========================================================
    def importData(self, source, *, source_type: str = None, **kwargs):
        """
        Load data into self.df from:
        - DataFrame
        - CSV / Excel / JSON / HTML
        - SQL query (requires con=...)

        Examples:
            dt.importData(df)
            dt.importData("data.csv")
            dt.importData("data.xlsx", sheet_name="Sheet1")
            dt.importData("https://site.com/table.html")
            dt.importData("SELECT * FROM users", source_type="sql", con=engine)
        """
        if isinstance(source, pd.DataFrame):
            self.df = source.copy()
            return self.df

        if not isinstance(source, str):
            raise TypeError("source must be a pandas DataFrame or a string (path/url/sql query).")

        # Auto-detect by extension if source_type not provided
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
                    "Cannot auto-detect file type. Provide source_type: "
                    "'csv'|'excel'|'json'|'html'|'sql'."
                )
            return self.df

        # Manual source_type
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
