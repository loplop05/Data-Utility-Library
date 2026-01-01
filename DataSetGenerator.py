import pandas as pd
import numpy as np


class DataSetGenerator:

    # ==========================================================
    """SECTION: Dataset 1 - General Testing Dataset"""
    # ==========================================================
    @staticmethod
    def generate_test_dataset(
            n_rows: int = 50_000,
            random_state: int = 42,
            duplicate_ratio: float = 0.05) -> pd.DataFrame:
        """
        Generate a large synthetic dataset for testing DataUtility.

        Includes:
        - numeric + categorical + text + datetime
        - missing values
        - outliers
        - duplicates
        """
        rng = np.random.default_rng(random_state)

        age = rng.integers(18, 65, size=n_rows).astype(float)
        salary = rng.normal(3000, 800, size=n_rows)
        rating = rng.integers(1, 6, size=n_rows).astype(float)

        departments = rng.choice(
            ["IT", "HR", "Finance", "Marketing", "Sales"],
            size=n_rows,
            p=[0.35, 0.15, 0.2, 0.15, 0.15]
        )

        cities = rng.choice(["Amman", "Irbid", "Zarqa", "Aqaba", "Madaba"], size=n_rows)

        names = rng.choice(
            [" Ali ", "SARA", "Omar!!", "mohammad ", "Lina", "Khaled??"],
            size=n_rows
        )

        reviews = rng.choice(
            [
                " Great product!!! ",
                "BAD quality",
                "Worth the price ",
                " not recommended...",
                "Excellent!!",
                " average "
            ],
            size=n_rows
        )

        join_dates = pd.to_datetime("2018-01-01") + pd.to_timedelta(
            rng.integers(0, 365 * 6, size=n_rows), unit="D"
        )

        df = pd.DataFrame({
            "age": age,
            "salary": salary,
            "rating": rating,
            "department": departments,
            "city": cities,
            "name": names,
            "review_text": reviews,
            "join_date": join_dates
        })

        # Missing values
        for col in ["age", "salary", "rating"]:
            mask = rng.random(n_rows) < 0.08
            df.loc[mask, col] = np.nan

        for col in ["city", "review_text"]:
            mask = rng.random(n_rows) < 0.05
            df.loc[mask, col] = None

        # Outliers
        outlier_idx = rng.choice(n_rows, size=int(0.01 * n_rows), replace=False)
        df.loc[outlier_idx, "salary"] *= 10
        df.loc[outlier_idx, "age"] = df.loc[outlier_idx, "age"] + 40

        # Duplicates
        n_dups = int(duplicate_ratio * n_rows)
        dup_rows = df.sample(n_dups, random_state=random_state)
        df = pd.concat([df, dup_rows], ignore_index=True)

        return df

    # ==========================================================
    """SECTION: Dataset 2 - Customer Churn Dataset"""
    # ==========================================================
    @staticmethod
    def customer_churn_dataset(
            n_rows: int = 50_000,
            random_state: int = 42,
            duplicate_ratio: float = 0.05) -> pd.DataFrame:

        rng = np.random.default_rng(random_state)

        age = rng.integers(18, 70, size=n_rows).astype(float)
        tenure = rng.integers(0, 72, size=n_rows).astype(float)
        monthly = rng.normal(35, 15, size=n_rows).clip(5, None)
        usage = rng.normal(120, 60, size=n_rows).clip(0, None)
        total = monthly * tenure + rng.normal(0, 40, size=n_rows)

        gender = rng.choice(["Male", "Female"], size=n_rows)
        city = rng.choice(["Amman", "Irbid", "Zarqa", "Aqaba", "Madaba"], size=n_rows)
        contract = rng.choice(["Month-to-month", "One year", "Two year"], size=n_rows, p=[0.6, 0.25, 0.15])
        payment = rng.choice(["Card", "Cash", "Bank transfer", "E-Wallet"], size=n_rows)

        signup = pd.to_datetime("2019-01-01") + pd.to_timedelta(
            rng.integers(0, 365 * 6, size=n_rows), unit="D"
        )

        notes = rng.choice(
            [" Good service! ", "BAD support...", " ok ", "EXCELLENT!!", "not recommended!!", None],
            size=n_rows,
            p=[0.22, 0.12, 0.22, 0.18, 0.12, 0.14],
        )

        base = 0.25
        churn_prob = (
                base
                + 0.12 * (contract == "Month-to-month")
                + 0.08 * (monthly > 60)
                - 0.10 * (tenure > 24)
        )
        churn_prob = np.clip(churn_prob, 0.02, 0.85)
        churn = (rng.random(n_rows) < churn_prob).astype(int)

        df = pd.DataFrame({
            "customer_id": [f"C{100000 + i}" for i in range(n_rows)],
            "age": age,
            "tenure_months": tenure,
            "monthly_charges": monthly,
            "total_charges": total,
            "usage_gb": usage,
            "gender": gender,
            "city": city,
            "contract_type": contract,
            "payment_method": payment,
            "signup_date": signup,
            "notes": notes,
            "churn": churn
        })

        # Missing
        for col in ["age", "tenure_months", "monthly_charges", "total_charges"]:
            mask = rng.random(n_rows) < 0.06
            df.loc[mask, col] = np.nan

        # Outliers
        out_idx = rng.choice(n_rows, size=int(0.01 * n_rows), replace=False)
        df.loc[out_idx, "monthly_charges"] *= 8
        df.loc[out_idx, "usage_gb"] *= 10

        # Duplicates
        n_dups = int(duplicate_ratio * n_rows)
        df = pd.concat([df, df.sample(n_dups, random_state=random_state)], ignore_index=True)

        return df

    # ==========================================================
    """SECTION: Dataset 3 - Fake Reviews Dataset"""
    # ==========================================================
    @staticmethod
    def fake_reviews_dataset(
            n_rows: int = 60_000,
            random_state: int = 42,
            duplicate_ratio: float = 0.04) -> pd.DataFrame:

        rng = np.random.default_rng(random_state)

        users = [f"U{10000 + i}" for i in range(int(n_rows * 0.4))]
        products = [f"P{20000 + i}" for i in range(int(n_rows * 0.2))]

        user_id = rng.choice(users, size=n_rows)
        product_id = rng.choice(products, size=n_rows)

        account_age = rng.integers(1, 3000, size=n_rows).astype(float)
        num_reviews_user = rng.poisson(15, size=n_rows).astype(float)
        burst_activity = rng.integers(0, 2, size=n_rows)

        avg_product_rating = rng.normal(3.8, 0.6, size=n_rows).clip(1, 5)
        num_reviews_product = rng.poisson(200, size=n_rows).astype(float)

        rating = rng.integers(1, 6, size=n_rows).astype(float)

        good_texts = ["Great product!", "Worth the price", "Works as expected", "Good quality", "Fast shipping"]
        bad_texts = ["Terrible", "Not recommended", "BAD quality!!!", "Waste of money", "Broke in one day"]
        spam_texts = ["BEST BEST BEST!!!", "Buy now!!!", "Amazing amazing amazing", "Perfect!!! 10/10", "Top top top"]

        base_text = rng.choice(good_texts + bad_texts + spam_texts, size=n_rows)
        noise = rng.choice(["", "  ", "!!!", "??", " ... ", "!!  "], size=n_rows)
        review_text = (base_text + noise).astype(object)

        review_date = pd.to_datetime("2020-01-01") + pd.to_timedelta(
            rng.integers(0, 365 * 5, size=n_rows), unit="D"
        )

        spam_flag = np.isin(base_text, spam_texts).astype(float)
        fake_prob = 0.10 + 0.25 * burst_activity + 0.15 * (account_age < 30) + 0.10 * (num_reviews_user > 50) + 0.20 * spam_flag
        fake_prob = np.clip(fake_prob, 0.01, 0.95)
        fake = (rng.random(n_rows) < fake_prob).astype(int)

        df = pd.DataFrame({
            "review_text": review_text,
            "rating": rating,
            "review_date": review_date,
            "user_id": user_id,
            "account_age_days": account_age,
            "num_reviews_by_user": num_reviews_user,
            "burst_activity": burst_activity,
            "product_id": product_id,
            "num_reviews_for_product": num_reviews_product,
            "avg_product_rating": avg_product_rating,
            "label_fake": fake
        })

        # Missing
        for col in ["rating", "account_age_days", "avg_product_rating"]:
            mask = rng.random(n_rows) < 0.05
            df.loc[mask, col] = np.nan
        mask = rng.random(n_rows) < 0.03
        df.loc[mask, "review_text"] = None

        # Outliers
        out_idx = rng.choice(n_rows, size=int(0.01 * n_rows), replace=False)
        df.loc[out_idx, "num_reviews_by_user"] *= 25
        df.loc[out_idx, "num_reviews_for_product"] *= 30

        # Duplicates
        n_dups = int(duplicate_ratio * n_rows)
        df = pd.concat([df, df.sample(n_dups, random_state=random_state)], ignore_index=True)

        return df

    # ==========================================================
    """SECTION: Dataset 4 - Sales Orders Dataset"""
    # ==========================================================
    @staticmethod
    def sales_orders_dataset(
            n_rows: int = 80_000,
            random_state: int = 42,
            duplicate_ratio: float = 0.03) -> pd.DataFrame:

        rng = np.random.default_rng(random_state)

        qty = rng.integers(1, 15, size=n_rows).astype(float)
        unit_price = rng.normal(25, 10, size=n_rows).clip(1, None)
        discount = rng.choice([0, 0.05, 0.10, 0.15, 0.20], size=n_rows, p=[0.5, 0.2, 0.15, 0.1, 0.05]).astype(float)
        shipping = rng.normal(4, 2, size=n_rows).clip(0, None)

        region = rng.choice(["North", "South", "East", "West"], size=n_rows)
        channel = rng.choice(["Online", "Store", "Reseller"], size=n_rows, p=[0.55, 0.35, 0.10])
        category = rng.choice(["Electronics", "Fashion", "Home", "Sports", "Beauty"], size=n_rows)
        payment = rng.choice(["Card", "Cash", "E-Wallet", "Bank Transfer"], size=n_rows)

        order_date = pd.to_datetime("2021-01-01") + pd.to_timedelta(
            rng.integers(0, 365 * 4, size=n_rows), unit="D"
        )

        revenue = qty * unit_price * (1 - discount)

        df = pd.DataFrame({
            "order_id": [f"O{500000 + i}" for i in range(n_rows)],
            "order_date": order_date,
            "region": region,
            "channel": channel,
            "category": category,
            "payment_type": payment,
            "quantity": qty,
            "unit_price": unit_price,
            "discount": discount,
            "shipping_cost": shipping,
            "revenue": revenue
        })

        # Missing
        for col in ["quantity", "unit_price", "shipping_cost"]:
            mask = rng.random(n_rows) < 0.04
            df.loc[mask, col] = np.nan

        # Outliers
        out_idx = rng.choice(n_rows, size=int(0.008 * n_rows), replace=False)
        df.loc[out_idx, "unit_price"] *= 20
        df.loc[out_idx, "quantity"] *= 10

        # Duplicates
        n_dups = int(duplicate_ratio * n_rows)
        df = pd.concat([df, df.sample(n_dups, random_state=random_state)], ignore_index=True)

        return df

    # ==========================================================
    """SECTION: Dataset 5 - Edge Cases Dataset"""
    # ==========================================================
    @staticmethod
    def edge_cases_dataset(
            n_rows: int = 30_000,
            random_state: int = 42) -> pd.DataFrame:

        rng = np.random.default_rng(random_state)

        constant = np.ones(n_rows)
        mixed = rng.choice([1, "2", "three", None, 4.5], size=n_rows)
        str_numbers = rng.choice(["10", "20", "30", None, "40", "not_a_number"], size=n_rows)
        heavy_missing = rng.choice([np.nan, np.nan, np.nan, 5, 10], size=n_rows).astype(float)

        text = rng.choice(["  Hello!!  ", "DATA   science", None, "??!!", "Clean_me...", "    "], size=n_rows)
        group = rng.choice(["A", "B", "C"], size=n_rows)

        date = pd.to_datetime("2022-01-01") + pd.to_timedelta(
            rng.integers(0, 365 * 2, size=n_rows), unit="D"
        )

        df = pd.DataFrame({
            "constant_col": constant,
            "mixed_col": mixed,
            "str_numbers": str_numbers,
            "heavy_missing": heavy_missing,
            "text_col": text,
            "group": group,
            "date": date
        })

        df = pd.concat([df, df.sample(int(0.06 * n_rows), random_state=random_state)], ignore_index=True)
        return df

    # ==========================================================
    """SECTION: Menu (Choose dataset + optional save)"""
    # ==========================================================
    @staticmethod
    def menu():
        """
        Console menu to generate one of the datasets.
        Returns:
            df (DataFrame) or None
        """
        options = {
            "1": ("General Testing Dataset", DataSetGenerator.generate_test_dataset),
            "2": ("Customer Churn Dataset", DataSetGenerator.customer_churn_dataset),
            "3": ("Fake Reviews Dataset", DataSetGenerator.fake_reviews_dataset),
            "4": ("Sales Orders Dataset", DataSetGenerator.sales_orders_dataset),
            "5": ("Edge Cases Dataset", DataSetGenerator.edge_cases_dataset),
        }

        print("\nDataset Generator Menu")
        print("----------------------")
        for k, (name, _) in options.items():
            print(f"{k}) {name}")
        print("0) Exit")

        choice = input("\nChoose dataset: ").strip()
        if choice == "0":
            return None
        if choice not in options:
            print("Invalid choice.")
            return None

        name, fn = options[choice]

        try:
            n_rows = int(input("Rows (default 50000): ").strip() or "50000")
        except ValueError:
            n_rows = 50000

        try:
            seed = int(input("Random seed (default 42): ").strip() or "42")
        except ValueError:
            seed = 42

        save = (input("Save to CSV? (y/n): ").strip().lower() == "y")
        filename = None
        if save:
            filename = input("CSV filename (default test_data.csv): ").strip() or "test_data.csv"

        # Generate dataset
        if fn is DataSetGenerator.edge_cases_dataset:
            df = fn(n_rows=n_rows, random_state=seed)
        else:
            try:
                dup_ratio = float(input("Duplicate ratio (default 0.05): ").strip() or "0.05")
            except ValueError:
                dup_ratio = 0.05
            df = fn(n_rows=n_rows, random_state=seed, duplicate_ratio=dup_ratio)

        print(f"\nGenerated: {name}")
        print("Shape:", df.shape)
        print(df.head(5))

        if save and filename:
            df.to_csv(filename, index=False)
            print(f"Saved to: {filename}")

        return df
