from django.db import models
from django.utils.text import slugify
import uuid
from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.utils.translation import gettext_lazy as _
import string
import random

class UtilisateurManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        """
        Créer et retourner un utilisateur avec un email et un mot de passe
        """
        if not email:
            raise ValueError(_('L\'email doit être fourni'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # Utiliser set_password pour hacher le mot de passe
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Créer et retourner un super utilisateur avec un email et un mot de passe
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(email, password, **extra_fields)


class Utilisateur(AbstractBaseUser):
    ROLE_CHOICES = (
        ('CLIENT', 'Client'),
        ('ADMIN', 'Admin'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    tel = models.CharField(max_length=15, blank=True, null=True)  # Ajoute ce champ
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='CLIENT')
    password = models.CharField(max_length=128 )

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)  # Permet l'accès à l'admin Django pour le superutilisateur
    is_superuser = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'  # Utiliser l'email comme identifiant
    REQUIRED_FIELDS = ['nom', 'prenom']  # Le prénom et le nom seront requis lors de la création

    objects = UtilisateurManager()

    def __str__(self):
        return f"{self.prenom} {self.nom} - {self.role}"

class Client(models.Model):
    utilisateur = models.OneToOneField(Utilisateur, on_delete=models.CASCADE, related_name="client")
   
    def __str__(self):
        return f"Client: {self.utilisateur.nom} {self.utilisateur.prenom}"

class Administrateur(models.Model):
    utilisateur = models.OneToOneField(Utilisateur, on_delete=models.CASCADE, related_name="administrateur")

    def __str__(self):
        return f"Admin: {self.utilisateur.nom} {self.utilisateur.prenom}"
    
class Visiteur(models.Model):
    session_id = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return f"Visiteur {self.session_id}"

class Product(models.Model):
    CATEGORY = (("Teint", "Teint"),
                ("Yeux", "Yeux"),
                ("Levres", "Lèvres"),
               )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(blank=True, null=True)
    image = models.ImageField(upload_to="produit",blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=15, choices=CATEGORY, blank=True, null=True)
    ingredient = models.TextField(blank=True, null=True)  # Nouveau champ
    stockDisponible = models.IntegerField(default=0)
    estDisponible = models.BooleanField(default=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="produits", null=True, blank=True)
    admin = models.ForeignKey(Administrateur, on_delete=models.CASCADE, related_name="produits", null=True, blank=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
            unique_slug = self.slug
            counter = 1

            while Product.objects.filter(slug=unique_slug).exists():
                unique_slug = f'{self.slug}-{counter}'
                counter += 1

            self.slug = unique_slug
        
        super().save(*args, **kwargs)

class Cart(models.Model):
    cart_code = models.CharField(max_length=11, unique=True)
    user=models.ForeignKey(Client, on_delete=models.CASCADE,  null=True, blank=True)
    visiteur = models.ForeignKey(Visiteur, on_delete=models.CASCADE, null=True, blank=True)  # Visiteur lié au panier
    paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True,blank=True, null=True)
    modified_at = models.DateTimeField(auto_now=True,blank=True, null=True)

    def __str__(self):
        return self.cart_code
    
    def save(self, *args, **kwargs):
        if not self.cart_code:
            self.cart_code = self.generate_unique_code()
        super().save(*args, **kwargs)

    def generate_unique_code(self):
        while True:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=11))
            if not Cart.objects.filter(cart_code=code).exists():
                return code

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product=models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity=models.IntegerField(default=1)
    def __str__(self):
        return f"{self.quantity} * {self.product.name} in cart {self.cart.id}"





class Commande(models.Model):
    STATUT_CHOICES = [
        ('EN_ATTENTE', 'En attente'),
        ('VALIDÉE', 'Validée'),
        ('ANNULÉE', 'Annulée'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="commandes")
    admin = models.ForeignKey(Administrateur, on_delete=models.CASCADE, related_name="commandes")
    montantTotal = models.DecimalField(max_digits=10, decimal_places=2)
    statut = models.CharField(max_length=10, choices=STATUT_CHOICES)
    dateCommande = models.DateTimeField(auto_now_add=True)
    rue = models.CharField(max_length=255)
    codePostal = models.CharField(max_length=10)
    ville = models.CharField(max_length=100)
    pays = models.CharField(max_length=100)

    def __str__(self):
        return f"Commande {self.id} - {self.statut}"

class LigneCommande(models.Model):
    commande = models.ForeignKey(Commande, on_delete=models.CASCADE, related_name="lignes")
    produit = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantite = models.IntegerField()
    prixUnitaire = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Ligne de commande pour {self.produit.name}"

class CommentaireProduit(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    produit = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="commentaires")
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="commentaires", null=True, blank=True)
    visiteur = models.ForeignKey(Visiteur, on_delete=models.CASCADE, related_name="commentaires", null=True, blank=True)
    contenu = models.TextField()
    noteSur5 = models.IntegerField()
    datePublication = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=~models.Q(client__isnull=False, visiteur__isnull=False),
                name="unique_client_or_visiteur_commentaire"
            )
        ]

    def __str__(self):
        return f"Commentaire de {self.client.utilisateur.nom if self.client else self.visiteur.session_id} sur {self.produit.name}"

class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name="notifications")
    message = models.TextField()
    dateEnvoi = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    type = models.CharField(max_length=50, default='info')  # info, success, warning, error


    def __str__(self):
        return f"Notification pour {self.utilisateur.nom} - {self.message}"
    
class Paiement(models.Model):
    METHOD_CHOICES = [
        ('CB', 'Carte Bancaire'),
        ('VIR', 'Virement'),
    ]
    STATUTS = [
        ('EN_ATTENTE', 'En attente'),
        ('SUCCES', 'Succès'),
        ('ECHEC', 'Échec'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    commande = models.OneToOneField(Commande, on_delete=models.CASCADE, related_name='paiement')
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    date_paiement = models.DateTimeField(auto_now_add=True)
    methode = models.CharField(max_length=50,choices=METHOD_CHOICES, default='Carte bancaire')  
    statut = models.CharField(max_length=20, choices=STATUTS, default='EN_ATTENTE')
    carte_numero = models.CharField(max_length=16, null=True, blank=True)
    carte_expiration = models.DateField(null=True, blank=True)
    carte_cvv = models.CharField(max_length=3, null=True, blank=True)
    

    def __str__(self):
        return f"Paiement pour commande {self.commande.id} - {self.statut}"


@receiver(post_migrate)
def create_default_admin(sender, **kwargs):
    if sender.name == "shop_app":  # S'assurer que cela s'exécute pour ton app
        if not Administrateur.objects.exists():  # Vérifie s'il y a déjà un admin
            print("✅ Aucun admin trouvé, création d'un administrateur par défaut...")
            admin_user = Utilisateur.objects.create(
                id=uuid.uuid4(),
                nom="Admin",
                prenom="Super",
                email="admin@example.com",
                role="ADMIN"
            )
            admin_user.set_password("12345678")  # Hache le mot de passe
            admin_user.save()  # Sauvegarde l'utilisateur après avoir haché son mot de passe
            Administrateur.objects.create(utilisateur=admin_user)
            print("✅ Administrateur créé avec succès !")
def reset_passwords():
    utilisateurs = Utilisateur.objects.all()
    for utilisateur in utilisateurs:
        if utilisateur.password == "temp_password_for_migration":
            utilisateur.set_password("12345678")  # Remplace par un mot de passe sécurisé
            utilisateur.save()

@receiver(post_migrate)
def reset_passwords_after_migration(sender, **kwargs):
    if sender.name == "shop_app":
        reset_passwords()
        print("✅ Mots de passe réinitialisés pour les utilisateurs.")    



