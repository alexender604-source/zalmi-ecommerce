ALTER TABLE "Inventory" ADD CONSTRAINT "inventory_single_owner" CHECK (("productId" IS NOT NULL)::int + ("variantId" IS NOT NULL)::int = 1);
ALTER TABLE "Product" ADD CONSTRAINT "product_prices_valid" CHECK ("regularPrice" >= 0 AND ("salePrice" IS NULL OR ("salePrice" >= 0 AND "salePrice" < "regularPrice")));
ALTER TABLE "ProductVariant" ADD CONSTRAINT "variant_prices_valid" CHECK (("regularPrice" IS NULL OR "regularPrice" >= 0) AND ("salePrice" IS NULL OR "salePrice" >= 0));
ALTER TABLE "Review" ADD CONSTRAINT "review_rating_valid" CHECK (rating BETWEEN 1 AND 5);
ALTER TABLE "OrderItem" ADD CONSTRAINT "order_item_quantity_valid" CHECK (quantity > 0 AND "unitPrice" >= 0);
ALTER TABLE "Coupon" ADD CONSTRAINT "coupon_amount_valid" CHECK (amount >= 0 AND (type <> 'PERCENTAGE' OR amount <= 100));
