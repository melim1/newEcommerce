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
    merge_cart,
    NotificationMarkAsReadView,
    WishlistView
  
    
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("products/", ProductListView.as_view(), name="products"),
    path("product_detail/<slug:slug>/", product_detail, name="product_detail"),
    path('visiteurs/', VisiteurListCreateView.as_view(), name='visiteur-list-create'),
    path('commandes/', CommandeListView.as_view(), name='commande-list'),
    path('commande/<uuid:id>/', CommandeDetailView.as_view(), name='commande-detail'),
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
     path('produits/ajouter/', ProductCreateView.as_view(), name='ajouter-produit'),
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
    path('merge_cart/', merge_cart, name='merge_cart'),
    path('transfer_visitor_cart/', views.transfer_visitor_cart, name='transfer_visitor_cart'),
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<uuid:pk>/mark-as-read/', NotificationMarkAsReadView.as_view(), name='notification-mark-as-read'),
    path('wishlist/', WishlistView.as_view(), name='wishlist'),

    

    





   
   ]
