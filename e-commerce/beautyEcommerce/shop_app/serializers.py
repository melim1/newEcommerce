from rest_framework import serializers
from .models import Utilisateur, Client, Administrateur, Product, Commande, LigneCommande, CommentaireProduit, Notification ,Visiteur,Cart, CartItem,Paiement,Wishlist
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model


# Serializer pour Utilisateur
class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = ['id', 'nom', 'prenom', 'email', 'role']

    def create(self, validated_data):
        # Hashage du mot de passe avant de le sauvegarder
        password = validated_data.pop('motDePasseHash', None)
        utilisateur = Utilisateur.objects.create(**validated_data)
        if password:
            utilisateur.motDePasseHash = make_password(password)
            utilisateur.save()
        return utilisateur

# Serializer pour Client
class ClientSerializer(serializers.ModelSerializer):
    utilisateur = UtilisateurSerializer()  # Intégration de l'Utilisateur dans le Client

    class Meta:
        model = Client
        fields = ['utilisateur']

    def create(self, validated_data):
        utilisateur_data = validated_data.pop('utilisateur')
        utilisateur = UtilisateurSerializer.create(UtilisateurSerializer(), validated_data=utilisateur_data)
        client = Client.objects.create(utilisateur=utilisateur)
        return client


# Serializer pour Administrateur
class AdministrateurSerializer(serializers.ModelSerializer):
    utilisateur = UtilisateurSerializer()  # Intégration de l'Utilisateur dans l'Administrateur

    class Meta:
        model = Administrateur
        fields = ['utilisateur']

    def create(self, validated_data):
        utilisateur_data = validated_data.pop('utilisateur')
        utilisateur = UtilisateurSerializer.create(UtilisateurSerializer(), validated_data=utilisateur_data)
        administrateur = Administrateur.objects.create(utilisateur=utilisateur)
        return administrateur
    
# Serializer pour Visiteur
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
    def get_total(self,cartitem):
        price = cartitem.product.price * cartitem.quantity
        return price

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(read_only = True, many=True)
    sum_total = serializers.SerializerMethodField()
    num_of_items= serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = ['id', 'cart_code','items','sum_total','num_of_items', 'created_at','modified_at']
    def get_sum_total(self, cart):
        items = cart.items.all()
        total = sum([item.product.price * item.quantity for item in items])
        return total
    def get_num_of_items(self, cart):
        items = cart.items.all()
        total = sum([item.quantity for item in items])
        return total



# Serializer pour Commande
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

# Serializer pour LigneCommande
class LigneCommandeSerializer(serializers.ModelSerializer):
    produit = ProductSerializer()  # On inclut les données du produit dans la ligne de commande

    class Meta:
        model = LigneCommande
        fields = ['commande', 'produit', 'quantite', 'prixUnitaire']

# CreateCommandeSerializer (modifié)
class CreateCommandeSerializer(serializers.Serializer):
    rue = serializers.CharField()
    codePostal = serializers.CharField()
    ville = serializers.CharField()
    pays = serializers.CharField()

    def create(self, validated_data):
        request = self.context['request']
        user = request.user
        client = Client.objects.get(utilisateur=user)
        
        # Récupérer le panier non payé, gérer l'exception si le panier n'existe pas
        try:
            cart = Cart.objects.get(user=client, paid=False)
        except Cart.DoesNotExist:
            raise serializers.ValidationError("Le panier n'existe pas ou il est déjà payé.")

        items = cart.items.all()

        if not items.exists():
            raise serializers.ValidationError("Le panier est vide.")

        # Choisir un admin (tu peux le faire aléatoirement ou prendre le premier)
        admin = Administrateur.objects.first()

        # Créer la commande
        commande = Commande.objects.create(
            client=client,
            admin=admin,
            montantTotal=sum([item.product.price * item.quantity for item in items]),
            statut='EN_ATTENTE',
            rue=validated_data['rue'],
            codePostal=validated_data['codePostal'],
            ville=validated_data['ville'],
            pays=validated_data['pays']
        )

        # Créer les lignes de commande
        for item in items:
            LigneCommande.objects.create(
                commande=commande,
                produit=item.product,
                quantite=item.quantity,
                prixUnitaire=item.product.price
            )

        # Marquer le panier comme payé
        cart.paid = True
        cart.save()

        return commande


class PaiementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paiement
        fields = ['id', 'commande', 'montant', 'methode', 'statut', 'date_paiement', 'carte_numero', 'carte_expiration', 'carte_cvv']

# Serializer pour CommentaireProduit
class CommentaireProduitSerializer(serializers.ModelSerializer):
    nom_utilisateur = serializers.SerializerMethodField(read_only=True)

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

        if user and user.is_authenticated:
            if hasattr(user, 'client'):
                commentaire.client = user.client
        else:
            # Tu peux ajouter une logique ici pour gérer les visiteurs
            # Exemple : récupérer un "visiteur" depuis un token ou session_id dans request
            pass

        commentaire.save()
        return commentaire


# Serializer pour Notification
class NotificationSerializer(serializers.ModelSerializer):
    utilisateur = UtilisateurSerializer()  # L'utilisateur à qui la notification est envoyée

    class Meta:
        model = Notification
        fields = '__all__'
        
class DetailedProductSerializer(serializers.ModelSerializer):
    similar_products = serializers.SerializerMethodField()
    class Meta: 
        model = Product
        fields = ["id", "name", "price", "slug", "image", "description","ingredient", "similar_products"] 

    def get_similar_products (self, product):
        products = Product.objects.filter(category=product.category).exclude(id=product.id) 
        serializer = ProductSerializer(products, many=True)
        return serializer.data      
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        #token["email"] = user.email  # Ajouter l'email dans le token
        token['role'] = user.role 
        return token    

class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = ['email', 'password', 'nom', 'prenom','tel', 'role']
        extra_kwargs = {'password': {'write_only': True}, 'role': {'read_only': True}}
    def create(self, validated_data):
        # Assurez-vous que le rôle est toujours défini sur 'CLIENT' pour l'enregistrement d'un utilisateur
        password = validated_data.pop('password')


        role = validated_data.pop('role', 'CLIENT') 

        user = Utilisateur.objects.create(**validated_data)
        user.set_password(password)
        user.role = role 
        user.save()
        return user
    
class UpdateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = ['nom', 'prenom', 'email', 'tel','password']  # Ajoute les champs à mettre à jour
        extra_kwargs = {'email': {'read_only': True}}  # L'email ne doit pas être modifiable     

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['nom', 'prenom', 'email','tel','password'] 
            
class WishlistSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    class Meta:
        model = Wishlist
        fields = ['id', 'utilisateur', 'product', 'added_at']
        read_only_fields = ['utilisateur', 'added_at']            
