BEGIN;
--
-- Create model Utilisateur
--
CREATE TABLE "shop_app_utilisateur" ("last_login" datetime NULL, "id" char(32) NOT NULL PRIMARY KEY, "nom" varchar(100) NOT NULL, "prenom" varchar(100) NOT NULL, "email" varchar(254) NOT NULL UNIQUE, "tel" varchar(15) NULL, "role" varchar(10) NOT NULL, "password" varchar(128) NOT NULL, "is_active" bool NOT NULL, "is_staff" bool NOT NULL, "is_superuser" bool NOT NULL);
--
-- Create model Visiteur
--
CREATE TABLE "shop_app_visiteur" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "session_id" varchar(255) NOT NULL UNIQUE);
--
-- Create model Administrateur
--
CREATE TABLE "shop_app_administrateur" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "utilisateur_id" char(32) NOT NULL UNIQUE REFERENCES "shop_app_utilisateur" ("id") DEFERRABLE INITIALLY DEFERRED);
--
-- Create model Client
--
CREATE TABLE "shop_app_client" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "utilisateur_id" char(32) NOT NULL UNIQUE REFERENCES "shop_app_utilisateur" ("id") DEFERRABLE INITIALLY DEFERRED);
--
-- Create model Cart
--
CREATE TABLE "shop_app_cart" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "cart_code" varchar(11) NOT NULL UNIQUE, "paid" bool NOT NULL, "created_at" datetime NULL, "modified_at" datetime NULL, "User_id" bigint NOT NULL REFERENCES "shop_app_client" ("id") DEFERRABLE INITIALLY DEFERRED);
--
-- Create model Commande
--
CREATE TABLE "shop_app_commande" ("id" char(32) NOT NULL PRIMARY KEY, "montantTotal" decimal NOT NULL, "statut" varchar(10) NOT NULL, "dateCommande" datetime NOT NULL, "rue" varchar(255) NOT NULL, "codePostal" varchar(10) NOT NULL, "ville" varchar(100) NOT NULL, "pays" varchar(100) NOT NULL, "admin_id" bigint NOT NULL REFERENCES "shop_app_administrateur" ("id") DEFERRABLE INITIALLY DEFERRED, "client_id" bigint NOT NULL REFERENCES "shop_app_client" ("id") DEFERRABLE INITIALLY DEFERRED);
--
-- Create model Notification
--
CREATE TABLE "shop_app_notification" ("id" char(32) NOT NULL PRIMARY KEY, "message" text NOT NULL, "dateEnvoi" datetime NOT NULL, "utilisateur_id" char(32) NOT NULL REFERENCES "shop_app_utilisateur" ("id") DEFERRABLE INITIALLY DEFERRED);
--
-- Create model Product
--
CREATE TABLE "shop_app_product" ("id" char(32) NOT NULL PRIMARY KEY, "name" varchar(255) NOT NULL, "slug" varchar(50) NULL, "image" varchar(100) NULL, "description" text NULL, "price" decimal NOT NULL, "category" varchar(15) NULL, "ingredient" text NULL, "stockDisponible" integer NOT NULL, "estDisponible" bool NOT NULL, "admin_id" bigint NULL REFERENCES "shop_app_administrateur" ("id") DEFERRABLE INITIALLY DEFERRED, "client_id" bigint NULL REFERENCES "shop_app_client" ("id") DEFERRABLE INITIALLY DEFERRED);
--
-- Create model LigneCommande
--
CREATE TABLE "shop_app_lignecommande" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "quantite" integer NOT NULL, "prixUnitaire" decimal NOT NULL, "commande_id" char(32) NOT NULL REFERENCES "shop_app_commande" ("id") DEFERRABLE INITIALLY DEFERRED, "produit_id" char(32) NOT NULL REFERENCES "shop_app_product" ("id") DEFERRABLE INITIALLY DEFERRED);
--
-- Create model CartItem
--
CREATE TABLE "shop_app_cartitem" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "quantity" integer NOT NULL, "cart_id" bigint NOT NULL REFERENCES "shop_app_cart" ("id") DEFERRABLE INITIALLY DEFERRED, "product_id" char(32) NOT NULL REFERENCES "shop_app_product" ("id") DEFERRABLE INITIALLY DEFERRED);
--
-- Create model CommentaireProduit
--
CREATE TABLE "shop_app_commentaireproduit" ("id" char(32) NOT NULL PRIMARY KEY, "contenu" text NOT NULL, "noteSur5" integer NOT NULL, "datePublication" datetime NOT NULL, "client_id" bigint NULL REFERENCES "shop_app_client" ("id") DEFERRABLE INITIALLY DEFERRED, "produit_id" char(32) NOT NULL REFERENCES "shop_app_product" ("id") DEFERRABLE INITIALLY DEFERRED, "visiteur_id" bigint NULL REFERENCES "shop_app_visiteur" ("id") DEFERRABLE INITIALLY DEFERRED, CONSTRAINT "unique_client_or_visiteur_commentaire" CHECK (NOT ("client_id" IS NOT NULL AND "visiteur_id" IS NOT NULL)));
CREATE INDEX "shop_app_cart_User_id_0b5eba50" ON "shop_app_cart" ("User_id");
CREATE INDEX "shop_app_commande_admin_id_65a451e8" ON "shop_app_commande" ("admin_id");
CREATE INDEX "shop_app_commande_client_id_5d037f1a" ON "shop_app_commande" ("client_id");
CREATE INDEX "shop_app_notification_utilisateur_id_67523c26" ON "shop_app_notification" ("utilisateur_id");
CREATE INDEX "shop_app_product_slug_f5aff027" ON "shop_app_product" ("slug");
CREATE INDEX "shop_app_product_admin_id_94c36977" ON "shop_app_product" ("admin_id");
CREATE INDEX "shop_app_product_client_id_d3cc9fd4" ON "shop_app_product" ("client_id");
CREATE INDEX "shop_app_lignecommande_commande_id_efa6b9b3" ON "shop_app_lignecommande" ("commande_id");
CREATE INDEX "shop_app_lignecommande_produit_id_63f4ffb6" ON "shop_app_lignecommande" ("produit_id");
CREATE INDEX "shop_app_cartitem_cart_id_3c17c7b4" ON "shop_app_cartitem" ("cart_id");
CREATE INDEX "shop_app_cartitem_product_id_c3751e04" ON "shop_app_cartitem" ("product_id");
CREATE INDEX "shop_app_commentaireproduit_client_id_53dcfb8f" ON "shop_app_commentaireproduit" ("client_id");
CREATE INDEX "shop_app_commentaireproduit_produit_id_42894ea4" ON "shop_app_commentaireproduit" ("produit_id");
CREATE INDEX "shop_app_commentaireproduit_visiteur_id_339d521e" ON "shop_app_commentaireproduit" ("visiteur_id");
COMMIT;
