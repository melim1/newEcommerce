from django.urls import path
from . import views
from .views import (
  VisiteurListCreateView,
    ProductListView,
    product_detail,
    CommandeListView,
    CommandeDetailView,
    NotificationListView,
    produits_en_avant,
    RegisterView,
    LoginView,
    LogoutView,
    ChangePasswordView,
    UpdateUserView,
    AdminDashboardView,
    ClientDashboardView,
    CustomTokenObtainPairView,
    ProductCreateView,
    ProductUpdateView,
    ProductDeleteView,
    UserInfoView,
    create_client_if_not_exists,
    AdminCommandeUpdateView,
    AdminCommandeListView,
    AdminCommandeDetailView,
    AdminUpdateCommandeStatusView,
    CommentairesProduitAPIView,
    ProductByClientView,
  
    
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("products/", ProductListView.as_view(), name="products"),
    path('product/', ProductByClientView.as_view(), name='produits_par_client'),
    path("product_detail/<slug:slug>/", product_detail, name="product_detail"),
    path('visiteurs/', VisiteurListCreateView.as_view(), name='visiteur-list-create'),
    path('commandes/', CommandeListView.as_view(), name='commande-list'),
    path('commande/<uuid:id>/', CommandeDetailView.as_view(), name='commande-detail'),
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('produits-en-avant/', produits_en_avant, name='produits_en_avant'),
    path("api/token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('update/', UpdateUserView.as_view(), name='update_user'),
    path('api/admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('api/client/dashboard/', ClientDashboardView.as_view(), name='client-dashboard'),
    path('api/produits/ajouter/', ProductCreateView.as_view(), name='ajouter-produit'),
    path('produits/<uuid:id>/modifier/', ProductUpdateView.as_view(), name='modifier-produit'),
    path('produits/<uuid:id>/supprimer/', ProductDeleteView.as_view(), name='supprimer-produit'),
    path('user_info/', UserInfoView.as_view(), name='user_info'),
    path('add_item/', views.add_item, name='add_item'),
    path('create_client_if_not_exists/', create_client_if_not_exists),
    path('get_cart/', views.get_cart, name='get_cart'),
    path('update_quantity/', views.update_quantity, name='update_quantity'),
    path('delete_cartitem/', views.delete_cartitem, name='delete_cartitem'),
    path('commande/', views.passer_commande, name='passer_commande'),
    path('paiement/', views.effectuer_paiement, name='effectuer_paiement'),
    path('api/admin/commande/<int:commande_id>/update/', AdminCommandeUpdateView.as_view(), name='admin-commande-update'),
    path('api/admin/commandes/', AdminCommandeListView.as_view(), name='admin-commandes-list'),
    path('api/admin/commandes/<uuid:id>/', AdminCommandeDetailView.as_view(), name='admin-commande-detail'),
    path('api/admin/commandes/<uuid:id>/status/', AdminUpdateCommandeStatusView.as_view(), name='admin-update-commande-status'),
    path('product_detail/<slug:slug>/commentaires/', CommentairesProduitAPIView.as_view(), name='commentaires-produit'),
 path('clients_admins/', views.clients_admins_list, name='clients_admins_list'),

    path('add_client/', views.add_client, name='add_client'),
    path('edit_client/<uuid:id>/', views.edit_client, name='edit_client'),
    path('delete_client/<uuid:id>/', views.delete_client, name='delete_client'),

    path('add_admin/', views.add_admin, name='add_admin'),
    path('edit_admin/<uuid:id>/', views.edit_admin, name='edit_admin'),
    path('delete_admin/<uuid:id>/', views.delete_admin, name='delete_admin'),
    path('api/admin/clients_count/', views.clients_count, name='clients-count'),
    path('api/admin/commandes_count/', views.commandes_count, name='commandes-count'),
    path('api/admin/produits_count/', views.produits_count, name='produits-count'),





   
   ]
