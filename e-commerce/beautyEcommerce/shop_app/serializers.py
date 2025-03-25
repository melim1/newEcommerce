from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name", "slug", "image", "description", "category", "price","ingredient","size"]
        
class DetailedProductSerializer(serializers.ModelSerializer):
    similar_products = serializers.SerializerMethodField()
    class Meta: 
        model = Product
        fields = ["id", "name", "price", "slug", "image", "description","ingredient","size", "similar_products"] 

    def get_similar_products (self, product):
        products = Product.objects.filter(category=product.category).exclude(id=product.id) 
        serializer = ProductSerializer(products, many=True)
        return serializer.data      