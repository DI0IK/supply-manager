CREATE TABLE IF NOT EXISTS "users" (
    "id" serial NOT NULL,
    "username" character varying(255) NOT NULL,
    "hash" character varying(1024) NOT NULL,
    "email" character varying(255) NOT NULL,
    "salt" character varying(255) NOT NULL,
    "created_at" timestamp with time zone NOT NULL,
    "updated_at" timestamp with time zone NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "sessions" (
    "id" serial NOT NULL,
    "user_id" integer NOT NULL,
    "token" character varying(255) NOT NULL,
    "created_at" timestamp with time zone NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "groups" (
    "id" serial NOT NULL,
    "name" character varying(255) NOT NULL,
    "created_at" timestamp with time zone NOT NULL,
    "owner_id" integer NOT NULL,
    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "users_groups" (
    "user_id" integer NOT NULL,
    "group_id" integer NOT NULL,
    CONSTRAINT "users_groups_pkey" PRIMARY KEY ("user_id", "group_id")
);

CREATE TABLE IF NOT EXISTS "products" (
    "barcode" character varying(255) NOT NULL,
    "brands" character varying(255) NOT NULL,
    "categories" character varying(255) NOT NULL,
    "completeness" float NOT NULL,
    "nutriscore" character NOT NULL,
    "product_name" character varying(255) NOT NULL,
    "quantity" character varying(255) NOT NULL,
    "cached_at" timestamp with time zone NOT NULL,
    CONSTRAINT "products_pkey" PRIMARY KEY ("barcode")
);

CREATE TABLE IF NOT EXISTS "groups_products" (
    "id" serial NOT NULL,
    "group_id" integer NOT NULL,
    "product_barcode" character varying(255) NOT NULL,
    "quantity" integer NOT NULL,
    "expiration_date" timestamp with time zone NOT NULL,
    CONSTRAINT "groups_products_pkey" PRIMARY KEY ("id")
);