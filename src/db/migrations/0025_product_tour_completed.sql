ALTER TABLE "user" ADD COLUMN "product_tour_completed" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "product_tour_completed" SET DEFAULT false;
