from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from math import pi

def default_marker_size():
    return {"width": 10, "height": 10}

class Panorama(models.Model):
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=200)
    image = models.ImageField(upload_to='panoramas/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    @property
    def image_url(self):
        return self.image.url if self.image else ''
    
    def __str__(self):
        return self.title


class PanoramaMarker(models.Model):
    panorama = models.ForeignKey(
        'Panorama', 
        on_delete=models.CASCADE, 
        related_name='markers',
        verbose_name="Базовая панорама"
    )
    linked_panorama = models.ForeignKey(
        'Panorama', 
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='linked_markers',  
        verbose_name="Связанная панорама"
    )    
    text = models.CharField(max_length=200, verbose_name="Текст тултипа маркера")
    yaw = models.FloatField(verbose_name="Горизонтальный угол (влево/вправо) (-Pi .. +Pi).")  
    pitch = models.FloatField(verbose_name="Вертикальный угол (вверх/вниз) (-Pi/2 .. +Pi/2).")  

    def clean(self):
        if not (-pi <= self.yaw <= pi):
            raise ValidationError("Горизонтальный угол (влево/вправо) должен быть от -Pi до +Pi")
        if not (-90 <= self.pitch <= 90):
            raise ValidationError("Вертикальный угол (вверх/вниз) должен быть от -Pi/2 до +Pi/2")
        

    def __str__(self):
        return f"{self.text} (yaw: {self.yaw}, pitch: {self.pitch})"
    


class Subscriber(models.Model):
    name = models.CharField(max_length=100, verbose_name="Имя")
    email = models.EmailField(verbose_name="Email", validators=[validate_email])
    ip_address = models.GenericIPAddressField(verbose_name="IP-адрес", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.email})"

    class Meta:
        verbose_name = "Подписчик"
        verbose_name_plural = "Подписчики"