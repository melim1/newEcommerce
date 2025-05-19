from rest_framework import serializers
from .models import Utilisateur, Client, Administrateur, Product, Commande, LigneCommande, CommentaireProduit, Notification ,Visiteur,Cart, CartItem,Paiement,Wishlist
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = ['email', 'password', 'nom', 'prenom', 'tel', 'role']
        extra_kwargs = {
            'password': {'write_only': True},
            'role': {'read_only': True}
        }

        def validate_tel(self, value):
            if not value.isdigit():
                raise serializers.ValidationError("Le numéro de téléphone doit contenir uniquement des chiffres.")
            if len(value) != 10:
                raise serializers.ValidationError("Le numéro de téléphone doit contenir exactement 10 chiffres.")
            if not value.startswith(('05', '06', '07')):
                raise serializers.ValidationError("Le numéro de téléphone doit commencer par 05, 06 ou 07.")
            return value
        def validate_password(self, value):
            if len(value) < 8:
                raise serializers.ValidationError("Le mot de passe doit contenir au moins 8 caractères.")
            return value
        def validate_email(self, value):
            if not (value.endswith('@example.com') or value.endswith('@gmail.com')):
                raise serializers.ValidationError("L'email doit se terminer par @example.com ou @gmail.com.")
            return value


    def create(self, validated_data):
        password = validated_data.pop('password')
        role = validated_data.pop('role', 'CLIENT')

        user = Utilisateur.objects.create(**validated_data)
        user.set_password(password)
        user.role = role
        user.save()
        return user

class ClientSerializer(serializers.ModelSerializer):
    utilisateur = UtilisateurSerializer()

    class Meta:
        model = Client
        fields = ['utilisateur']

    def create(self, validated_data):
        utilisateur_data = validated_data.pop('utilisateur')
        utilisateur = UtilisateurSerializer().create(utilisateur_data)
        client = Client.objects.create(utilisateur=utilisateur)
        return client

class AdministrateurSerializer(serializers.ModelSerializer):
    utilisateur = UtilisateurSerializer()

    class Meta:
        model = Administrateur
        fields = ['utilisateur']

    def create(self, validated_data):
        utilisateur_data = validated_data.pop('utilisateur')
        utilisateur = UtilisateurSerializer().create(utilisateur_data)
        administrateur = Administrateur.objects.create(utilisateur=utilisateur)
        return administrateur

class VisiteurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visiteur
        fields = ['id', 'session_id']

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'image', 'description', 'price', 'category', 'ingredient', 'stockDisponible', 'estDisponible']

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'quantity', 'product', 'total']

    def get_total(self, cartitem):
        return cartitem.product.price * cartitem.quantity

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(read_only=True, many=True)
    sum_total = serializers.SerializerMethodField()
    num_of_items = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'cart_code', 'items', 'sum_total', 'num_of_items', 'created_at', 'modified_at']

    def get_sum_total(self, cart):
        return sum(item.product.price * item.quantity for item in cart.items.all())

    def get_num_of_items(self, cart):
        return sum(item.quantity for item in cart.items.all())

class LigneCommandeSerializer(serializers.ModelSerializer):
    produit = ProductSerializer()

    class Meta:
        model = LigneCommande
        fields = ['commande', 'produit', 'quantite', 'prixUnitaire']

class CommandeSerializer(serializers.ModelSerializer):
    client = ClientSerializer()
    admin = AdministrateurSerializer()
    lignes = serializers.SerializerMethodField()

    class Meta:
        model = Commande
        fields = ['id', 'client', 'admin', 'montantTotal', 'statut', 'dateCommande', 'rue', 'codePostal', 'ville', 'pays', 'lignes']

    def get_lignes(self, obj):
        lignes = LigneCommande.objects.filter(commande=obj)
        return LigneCommandeSerializer(lignes, many=True).data

class CreateCommandeSerializer(serializers.Serializer):
    rue = serializers.CharField()
    codePostal = serializers.CharField()
    ville = serializers.CharField()
    pays = serializers.CharField()

    def create(self, validated_data):
        request = self.context['request']
        user = request.user
        client = Client.objects.get(utilisateur=user)

        cart = Cart.objects.get(user=client, paid=False)
        items = cart.items.all()
        if not items:
            raise serializers.ValidationError("Le panier est vide.")

        admin = Administrateur.objects.first()

        commande = Commande.objects.create(
            client=client,
            admin=admin,
            montantTotal=sum(item.product.price * item.quantity for item in items),
            statut='EN_ATTENTE',
            rue=validated_data['rue'],
            codePostal=validated_data['codePostal'],
            ville=validated_data['ville'],
            pays=validated_data['pays']
        )

        for item in items:
            LigneCommande.objects.create(
                commande=commande,
                produit=item.product,
                quantite=item.quantity,
                prixUnitaire=item.product.price
            )

        cart.paid = True
        cart.save()

        return commande

class PaiementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paiement
        fields = ['id', 'commande', 'montant', 'methode', 'statut', 'date_paiement', 'carte_numero', 'carte_expiration', 'carte_cvv']

class CommentaireProduitSerializer(serializers.ModelSerializer):
    nom_utilisateur = serializers.SerializerMethodField()

    class Meta:
        model = CommentaireProduit
        fields = ['id', 'produit', 'contenu', 'noteSur5', 'datePublication', 'nom_utilisateur']
        read_only_fields = ['datePublication', 'nom_utilisateur']

    def get_nom_utilisateur(self, obj):
        if obj.client:
            return obj.client.utilisateur.nom
        elif obj.visiteur:
            return f"Visiteur {obj.visiteur.session_id[-4:]}"
        return "Anonyme"

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user if request else None

        commentaire = CommentaireProduit(**validated_data)
        if user and user.is_authenticated and hasattr(user, 'client'):
            commentaire.client = user.client
        commentaire.save()
        return commentaire

class NotificationSerializer(serializers.ModelSerializer):
    utilisateur = UtilisateurSerializer()

    class Meta:
        model = Notification
        fields = '__all__'

class WishlistSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'utilisateur', 'product', 'added_at']
        read_only_fields = ['utilisateur', 'added_at']

class DetailedProductSerializer(serializers.ModelSerializer):
    similar_products = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "name", "price", "slug", "image", "description", "ingredient", "similar_products"]

    def get_similar_products(self, product):
        products = Product.objects.filter(category=product.category).exclude(id=product.id)
        return ProductSerializer(products, many=True).data

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        return token

class UpdateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = ['nom', 'prenom', 'email', 'tel', 'password']
        extra_kwargs = {'email': {'read_only': True}}

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['nom', 'prenom', 'email', 'tel', 'password']
