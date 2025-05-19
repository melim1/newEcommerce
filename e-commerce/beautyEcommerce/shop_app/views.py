from django.shortcuts import render
from rest_framework.decorators import api_view,permission_classes
from .models import Product, Visiteur, Cart,CartItem, Commande, CommentaireProduit, Notification,Utilisateur,Client,Paiement,Wishlist
from .serializers import ProductSerializer, DetailedProductSerializer,VisiteurSerializer, CommandeSerializer,CommentaireProduitSerializer,NotificationSerializer,CartItemSerializer,ClientSerializer,CartSerializer,PaiementSerializer,WishlistSerializer
from rest_framework.response import Response
from rest_framework import generics
import random
import string
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer,CreateCommandeSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework import status, permissions
from django.contrib.auth.hashers import make_password
from .serializers import UtilisateurSerializer, UpdateUserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .permissions import IsAdmin
from .permissions import IsClient
from rest_framework.parsers import MultiPartParser, FormParser
import datetime
from .serializers import ProductSerializer, DetailedProductSerializer
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Notification, Utilisateur
from rest_framework.permissions import IsAuthenticatedOrReadOnly
# views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import ClientSerializer, AdministrateurSerializer
from .models import Client, Administrateur
from rest_framework.permissions import AllowAny

from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Client, Administrateur
from .serializers import ClientSerializer, AdministrateurSerializer
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .permissions import IsAdmin

@api_view(['GET'])
@permission_classes([AllowAny])
def clients_count(request):
    count = Client.objects.count()
    return JsonResponse({'count': count}, content_type='application/json')

@api_view(['GET'])
@permission_classes([AllowAny])
def commandes_count(request):
    count = Commande.objects.count()
    return JsonResponse({'count': count}, content_type='application/json')

@api_view(['GET'])
@permission_classes([AllowAny])
def produits_count(request):
    total = Product.objects.count()
    disponibles = Product.objects.filter(estDisponible=True).count()
    return JsonResponse({
        'count': total,
        'disponibles': disponibles,
        'non_disponibles': total - disponibles
    }, content_type='application/json')

# --------------------------- CLIENT ---------------------------

@api_view(['GET'])
@permission_classes([AllowAny])
def clients_admins_list(request):
    clients = Client.objects.all()
    admins = Administrateur.objects.all()
    
    serialized_clients = ClientSerializer(clients, many=True).data
    serialized_admins = AdministrateurSerializer(admins, many=True).data

    return Response({
        'clients': serialized_clients,
        'admins': serialized_admins,
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def add_client(request):
    serializer = ClientSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'PATCH'])
@permission_classes([AllowAny])
def edit_client(request, id):
    client = get_object_or_404(Client, id=id)
    serializer = ClientSerializer(client, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_client(request, id):
    try:
        # Trouver le client via l'ID client ou l'ID utilisateur
        try:
            client = get_object_or_404(Client, id=id)
        except:
            client = get_object_or_404(Client, utilisateur__id=id)
            
        utilisateur = client.utilisateur
        client.delete()
        utilisateur.delete()
        return Response({"message": "Client supprimé avec succès."}, status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
@api_view(['POST'])
@permission_classes([AllowAny])
def add_admin(request):
    serializer = AdministrateurSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'PATCH'])
@permission_classes([AllowAny])
def edit_admin(request, id):
    admin = get_object_or_404(Administrateur, id=id)
    serializer = AdministrateurSerializer(admin, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_admin(request, id):
    try:
        # Trouver l'admin via l'ID admin ou l'ID utilisateur
        try:
            admin = get_object_or_404(Administrateur, id=id)
        except:
            admin = get_object_or_404(Administrateur, utilisateur__id=id)
            
        utilisateur = admin.utilisateur
        admin.delete()
        utilisateur.delete()
        return Response({"message": "Administrateur supprimé avec succès."}, status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Create your views here.

class ProductListView(generics.ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer



class ProductByClientView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        try:
            client = Client.objects.get(utilisateur=user)
            return Product.objects.filter(client=client)
        except Client.DoesNotExist:
            return Product.objects.none()


@api_view(["GET"])
def product_detail(request, slug):
 product = Product.objects.get(slug=slug)
 serializer = DetailedProductSerializer(product)
 return Response(serializer.data)

class VisiteurListCreateView(generics.ListCreateAPIView):
    queryset = Visiteur.objects.all()
    serializer_class = VisiteurSerializer

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_client_if_not_exists(request):
    user = request.user
    if user.role != "CLIENT":
        return Response({"error": "Only clients can be created."}, status=400)

    # Vérifie si le client existe déjà
    client_exists = Client.objects.filter(utilisateur=user).exists()
    if not client_exists:
        Client.objects.create(utilisateur=user)
        return Response({"message": "Client created."}, status=201)
    return Response({"message": "Client already exists."}, status=200)


@api_view(["POST"])
def add_item(request):
    print("Requête reçue:", request.data)

    try:
        product_id = request.data.get("product_id")
        quantite = request.data.get("quantite", 1)
        user = request.user

        # Utilisateur connecté
        if user.is_authenticated:
            try:
                client = Client.objects.get(utilisateur=user)
            except Client.DoesNotExist:
                return Response({"error": "You must be a registered Client to add items to the cart."}, status=400)

            # Éviter les doublons de panier
            carts = Cart.objects.filter(user=client, paid=False)
            if carts.count() > 1:
                cart = carts.latest('created_at')
                carts.exclude(id=cart.id).delete()
            else:
                cart = carts.first()

            if not cart:
                cart = Cart.objects.create(user=client, paid=False)

        # Utilisateur anonyme (visiteur)
        else:
            session_id = request.data.get("session_id")
            if not session_id:
                return Response({"error": "session_id is required for anonymous users"}, status=400)

            visiteur, _ = Visiteur.objects.get_or_create(session_id=session_id)
            cart, _ = Cart.objects.get_or_create(visiteur=visiteur, paid=False)

        # Vérifier que le produit existe
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=404)

        # Ajouter ou mettre à jour l'article dans le panier
        cartitem, created = CartItem.objects.get_or_create(cart=cart, product=product)
        cartitem.quantity = quantite
        cartitem.save()

        serializer = CartItemSerializer(cartitem)
        return Response({"data": serializer.data, "message": "Cart item created successfully"}, status=201)

    except Exception as e:
        return Response({"error": str(e)}, status=400)
from rest_framework.permissions import AllowAny

@api_view(['GET'])
def get_cart(request):
  

    try:
        if request.user.is_authenticated:
            client = Client.objects.get(utilisateur=request.user)
            cart, _ = Cart.objects.get_or_create(user=client, paid=False)
        else:
            session_id = request.GET.get('session_id')
            if not session_id:
                return Response({"error": "session_id is required for anonymous users"}, status=400)
            visiteur = Visiteur.objects.get(session_id=session_id)
            cart, _ = Cart.objects.get_or_create(visiteur=visiteur, paid=False)

        serializer = CartSerializer(cart)
        return Response(serializer.data, status=200)

    except Client.DoesNotExist:
        return Response({"error": "Client not found"}, status=404)
    except Visiteur.DoesNotExist:
        return Response({"error": "Invalid session_id"}, status=400)
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['PATCH'])
def update_quantity(request):
    try:
        cartitem_id= request.data.get("item_id")
        quantity = request.data.get("quantity")
        quantity = int(quantity)
        cartitem = CartItem.objects.get(id=cartitem_id)
        cartitem.quantity = quantity
        cartitem.save()
        serializer = CartItemSerializer(cartitem)
        return Response({"data":serializer.data, "message": "Cartitem updated successfully"})
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['POST'])
def delete_cartitem(request):
    cartitem_id = request.data.get("item_id")
    cartitem = CartItem.objects.get(id=cartitem_id)
    cartitem.delete()
    return Response({"message": "article supprimé"}, status=status.HTTP_204_NO_CONTENT)



class CommandeListView(generics.ListAPIView):
    serializer_class = CommandeSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        try:
            client = Client.objects.get(utilisateur=user)
            return Commande.objects.filter(client=client)
        except Client.DoesNotExist:
            return Commande.objects.none()

class CommandeDetailView(generics.RetrieveAPIView):
    queryset = Commande.objects.all()
    serializer_class = CommandeSerializer
    lookup_field = 'id'

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def passer_commande(request):
    serializer = CreateCommandeSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        commande = serializer.save()

        Notification.objects.create(
            utilisateur=request.user,
            message=f"Votre commande #{commande.id} a été passée avec succès.",
            type='info'
        )

        return Response({'message': 'Commande créée avec succès.', 'commande_id': str(commande.id)})
    return Response(serializer.errors, status=400)

class CreateNotificationAPIView(APIView):
    permission_classes = [IsAuthenticated]  # Assure-toi que l'utilisateur est authentifié

    def post(self, request):
        user_id = request.data.get('user_id')  # On récupère l'user_id envoyé
        message = request.data.get('message')  # On récupère le message de la notification

        if not user_id or not message:
            return Response({'error': 'user_id et message sont requis'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = Utilisateur.objects.get(id=user_id)

        except Utilisateur.DoesNotExist:
            return Response({'error': 'Utilisateur non trouvé'}, status=status.HTTP_404_NOT_FOUND)

        # Créer la notification
        notification = Notification.objects.create(user=user, message=message)

        return Response({'message': 'Notification envoyée avec succès', 'notification_id': notification.id}, status=status.HTTP_201_CREATED)
# Vue pour gérer le paiement d'une commande
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def effectuer_paiement(request):
    # Récupérer l'ID de la commande et les détails du paiement
    commande_id = request.data.get('commande_id')
    montant = request.data.get('montant')
    methode = request.data.get('methode')  # 'CB', 'VIR', etc.
    
    carte_numero = request.data.get('carte_numero', None)
    carte_expiration = request.data.get('carte_expiration', None)
    carte_cvv = request.data.get('carte_cvv', None)

    if not commande_id or not montant or not methode:
        return Response({'error': 'Informations de paiement manquantes'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        commande = Commande.objects.get(id=commande_id, client__utilisateur=request.user)
    except Commande.DoesNotExist:
        return Response({'error': 'Commande introuvable ou non associée à cet utilisateur'}, status=status.HTTP_404_NOT_FOUND)

    # Simuler un paiement (vous pouvez intégrer une API de paiement réel ici comme Stripe, PayPal, etc.)
    paiement_reussi = random.choice([True, False])  # Simule un paiement aléatoire

    if paiement_reussi:
        # Créer un enregistrement de paiement
        paiement = Paiement.objects.create(
            commande=commande,
            montant=montant,
            methode=methode,
            statut='SUCCES',
            carte_numero=carte_numero,
            carte_expiration=carte_expiration,
            carte_cvv=carte_cvv
        )

        # Marquer la commande comme payée
        commande.status = 'PAID'
        commande.save()
         
          # Créer une notification pour l'utilisateur
        notification_message = f"Votre commande #{commande.id} a été payée avec succès."
        print(f"Notification: {notification_message}")

        Notification.objects.create(
            utilisateur=request.user,  # L'utilisateur connecté
            message=f"Votre commande #{commande.id} a été payée avec succès.",
            dateEnvoi=commande.dateCommande  # La date de la commande
        )


        # Retourner une réponse de succès
        return Response({
            'message': 'Paiement effectué avec succès',
            'paiement': PaiementSerializer(paiement).data
        }, status=status.HTTP_201_CREATED)
    else:
        return Response({'error': 'Échec du paiement, veuillez réessayer'}, status=status.HTTP_400_BAD_REQUEST)

class AdminCommandeUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]  # Limité aux admins

    def patch(self, request, commande_id):
        try:
            commande = Commande.objects.get(id=commande_id)

            # Récupérer les champs qu'on peut modifier
            statut = request.data.get('status')
            action = request.data.get('action')  

            if action == 'valider':
                commande.status = 'VALIDEE'
            elif action == 'refuser':
                commande.status = 'REFUSEE'
            elif statut:  # Si un statut est directement envoyé (optionnel)
                commande.status = statut
            else:
                return Response({'error': 'Aucune action valide spécifiée.'}, status=400)

            commande.save()
            serializer = CommandeSerializer(commande)
            return Response({'message': 'Commande mise à jour avec succès', 'commande': serializer.data})

        except Commande.DoesNotExist:
            return Response({'error': 'Commande introuvable'}, status=404)
class ClientCommandeListView(generics.ListAPIView):
    serializer_class = CommandeSerializer
    permission_classes = [IsAuthenticated, IsClient]

    def get_queryset(self):
        client = self.request.user.client  # L'utilisateur connecté est un client
        return Commande.objects.filter(
            lignes__produit__client=client
        ).distinct()


class changer_statut(APIView):

    def get_queryset(self):
        client = self.request.user.client
        return Commande.objects.filter(lignes__produit__client=client).distinct()

    def patch(self, request, id):
        try:
            commande = self.get_queryset().get(id=id)
        except Commande.DoesNotExist:
            return Response({'error': 'Commande non trouvée'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('statut')
        if not new_status:
            return Response({'error': 'Le statut est requis'}, status=status.HTTP_400_BAD_REQUEST)

        valid_statuses = ['EXPÉDIÉ', 'VALIDÉE', 'ANNULÉE']
        if new_status not in valid_statuses:
            return Response({'error': 'Statut invalide'}, status=status.HTTP_400_BAD_REQUEST)

        commande.statut = new_status
        commande.save()

        return Response({'message': f'Statut de la commande mis à jour à {new_status}'}, status=status.HTTP_200_OK)



class AdminCommandeListView(generics.ListAPIView):
    serializer_class = CommandeSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        queryset = Commande.objects.all()
        statut = self.request.query_params.get('status')
        utilisateur_id = self.request.query_params.get('user_id')

        if statut:
            queryset = queryset.filter(status=statut)
        if utilisateur_id:
            queryset = queryset.filter(client__utilisateur__id=utilisateur_id)

        return queryset

class AdminCommandeDetailView(generics.RetrieveAPIView):
    queryset = Commande.objects.all()
    serializer_class = CommandeSerializer
    lookup_field = 'id'
    permission_classes = [IsAuthenticated, IsAdmin]

class AdminUpdateCommandeStatusView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, id):
        # Récupérer la commande
        try:
            commande = Commande.objects.get(id=id)
        except Commande.DoesNotExist:
            return Response({'error': 'Commande introuvable'}, status=status.HTTP_404_NOT_FOUND)

        # Récupérer le nouveau statut
        new_status = request.data.get('statut')
        if not new_status:
            return Response({'error': 'Le statut est requis'}, status=status.HTTP_400_BAD_REQUEST)

        # Liste des statuts valides (ajoutez ou modifiez selon vos besoins)
        valid_statuses = ['EXPÉDIÉ', 'VALIDÉE', 'ANNULÉE']

        if new_status not in valid_statuses:
            return Response({'error': 'Statut invalide'}, status=status.HTTP_400_BAD_REQUEST)

        # Mise à jour du statut
        commande.statut = new_status
        commande.save()

        return Response({'message': f'Statut de la commande mis à jour à {new_status}'}, status=status.HTTP_200_OK)






class CommentairesProduitAPIView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, slug):
        try:
            produit = Product.objects.get(slug=slug)
        except Product.DoesNotExist:
            return Response({'error': 'Produit introuvable'}, status=status.HTTP_404_NOT_FOUND)
        
        commentaires = CommentaireProduit.objects.filter(produit=produit).order_by('-datePublication')
        serializer = CommentaireProduitSerializer(commentaires, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, slug):
        try:
            produit = Product.objects.get(slug=slug)
        except Product.DoesNotExist:
            return Response({'error': 'Produit introuvable'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data.copy()
        data['produit'] = produit.id
        serializer = CommentaireProduitSerializer(data=data, context={'request': request})

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(utilisateur=self.request.user).order_by('-dateEnvoi')


@api_view(['GET'])
def produits_en_avant(request):
    produits = list(Product.objects.filter(estDisponible=True))  
    propositions = random.sample(produits, min(len(produits), 4))  # Sélectionne 5 produits max
    data = [{"id": p.id, "name": p.name, "price": p.price, "image": p.image.url if p.image else None} for p in propositions]
    
    return Response(data)    


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class SomeProtectedView(APIView):
    permission_classes = [IsAuthenticated]  # Cela protégera l'API

    def get(self, request):
        return Response({"message": "Accès autorisé"})    


class RegisterView(APIView):
    def post(self, request):
        serializer = UtilisateurSerializer(data=request.data)
        
        if serializer.is_valid():
            # Hash le mot de passe avant de sauvegarder l'utilisateur
            utilisateur = serializer.save(password=make_password(serializer.validated_data['password']))
            return Response({"message": "Utilisateur créé avec succès"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class MyTokenObtainPairView(TokenObtainPairView):
     serializer_class = CustomTokenObtainPairSerializer  # Assurez-vous d'utiliser le bon serializer

     def post(self, request, *args, **kwargs):
        # Appelle la méthode parente pour obtenir les tokens
        response = super().post(request, *args, **kwargs)

        # Ajoute le rôle à la réponse
        if response.status_code == 200:
            user = request.user
            role = user.role  # Ici on suppose que `role` est un champ sur ton modèle Utilisateur
            print("Rôle de l'utilisateur:", role) 
            response.data['role'] = role

        return response
       
# Les autres vues comme RegisterView, LogoutView, etc.
class RegisterView(APIView):
    def post(self, request):
        serializer = UtilisateurSerializer(data=request.data)
        
        if serializer.is_valid():
            # Hash le mot de passe avant de sauvegarder l'utilisateur
            #role = serializer.validated_data.get('role', 'CLIENT')
            #utilisateur = serializer.save(password=make_password(serializer.validated_data['password']))
            user = serializer.save()
            return Response({
                "message": "Client créé avec succès",
                "nom": user.nom,
                "email": user.email,
                "role": user.role  # Inclure le rôle dans la réponse
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class LoginView(APIView):
    permission_classes = [IsAuthenticated]
    

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        try:
            user = Utilisateur.objects.get(email=email)
            
            # Vérifier si le mot de passe est correct
            if user.check_password(password):
                # Si l'utilisateur est un admin
                if user.role == 'ADMIN':
                    # Générer un token JWT
                    refresh = RefreshToken.for_user(user)
                    return Response({
                        'access': str(refresh.access_token),
                        'refresh': str(refresh),
                        'role': user.role,
                    })
                else:
                    return Response({'error': 'Utilisateur non autorisé'}, status=403)

            else:
                return Response({'error': 'Identifiants incorrects'}, status=400)

        except Utilisateur.DoesNotExist:
            return Response({'error': 'Utilisateur non trouvé'}, status=404)
        
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Récupère le token depuis l'en-tête Authorization (format: Bearer <refresh_token>)
            authorization_header = request.headers.get('Authorization')
            if authorization_header is None:
                return Response({"message": "Token manquant dans l'en-tête"}, status=status.HTTP_400_BAD_REQUEST)

            # Le token est dans le format 'Bearer <refresh_token>'
            refresh_token = authorization_header.split(' ')[1]

            # Créer un token de type RefreshToken
            token = RefreshToken(refresh_token)

            # Noircir le refresh token pour invalider ce dernier
            token.blacklist()

            return Response({"message": "Déconnexion réussie"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"message": "Erreur lors de la déconnexion", "error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not user.check_password(old_password):
            return Response({"message": "Mot de passe actuel incorrect"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"message": "Mot de passe changé avec succès"}, status=status.HTTP_200_OK) 

class UpdateUserView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user  # Utilisateur authentifié
        serializer = UpdateUserSerializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()  # Sauvegarder les modifications
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  


class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        return Response({"message": "Bienvenue sur le tableau de bord administrateur"})
class ClientDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsClient]

    def get(self, request):
        return Response({"message": "Bienvenue sur votre espace client"})    


# Ajouter un produit
class ProductCreateView(generics.CreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)  

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'ADMIN':
            serializer.save(admin=user.administrateur)
        elif user.role == 'CLIENT':
            serializer.save(client=user.client)
       
# Modifier un produit
class ProductUpdateView(generics.UpdateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = 'id'
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)  

    def perform_update(self, serializer):
        serializer.save()

# Supprimer un produit
class ProductDeleteView(generics.DestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = 'id'
    permission_classes = [IsAuthenticated]

class UserInfoView(generics.RetrieveAPIView):
    serializer_class = UtilisateurSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user




class WishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wishlist_items = Wishlist.objects.filter(utilisateur=request.user)
        serializer = WishlistSerializer(wishlist_items, many=True)
        return Response(serializer.data)

    def post(self, request):
        product_id = request.data.get('product')
        if not product_id:
            return Response({'error': 'Le champ product est requis.'}, status=status.HTTP_400_BAD_REQUEST)

        if Wishlist.objects.filter(utilisateur=request.user, product_id=product_id).exists():
            return Response({'message': 'Produit déjà dans la wishlist.'}, status=status.HTTP_200_OK)

        wishlist_item = Wishlist(utilisateur=request.user, product_id=product_id)
        wishlist_item.save()
        serializer = WishlistSerializer(wishlist_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request):
        product_id = request.data.get('product')
        if not product_id:
            return Response({'error': 'Le champ product est requis.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            wishlist_item = Wishlist.objects.get(utilisateur=request.user, product_id=product_id)
            wishlist_item.delete()
            return Response({'message': 'Produit supprimé de la wishlist.'}, status=status.HTTP_204_NO_CONTENT)
        except Wishlist.DoesNotExist:
            return Response({'error': 'Produit non trouvé dans la wishlist.'}, status=status.HTTP_404_NOT_FOUND)


class UserNotificationsView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(utilisateur=self.request.user).order_by('-dateEnvoi')


def generate_cart_code(length=11):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def transfer_visitor_cart(request):
    session_id = request.data.get("session_id")
    items = request.data.get("items", [])

    if not session_id or not items:
        return Response({"error": "Session ID et items requis."}, status=400)

    try:
        visiteur = Visiteur.objects.get(session_id=session_id)
        client = Client.objects.get(utilisateur=request.user)

        # Récupérer ou créer le panier du client
        cart, _ = Cart.objects.get_or_create(user=client, paid=False, defaults={"cart_code": generate_cart_code()})

        for item in items:
            product_id = item.get("product_id")
            quantity = item.get("quantity", 1)

            try:
                product = Product.objects.get(id=product_id)
            except Product.DoesNotExist:
                continue  # On ignore si le produit n’existe pas

            # Ajouter ou mettre à jour les articles
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                product=product,
                defaults={"quantity": quantity}
            )

            if not created:
                cart_item.quantity += quantity
                cart_item.save()

        return Response({"message": "Panier visiteur transféré avec succès."})

    except Visiteur.DoesNotExist:
        return Response({"error": "Visiteur introuvable."}, status=404)
    except Client.DoesNotExist:
        return Response({"error": "Client introuvable."}, status=404)

