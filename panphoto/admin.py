from django.contrib import admin
from django import forms
from django.db import models
from django.utils.safestring import mark_safe
from .models import Panorama, PanoramaMarker, Subscriber
from django.http import HttpResponseRedirect
from django.urls import reverse

class MarkerForm(forms.ModelForm):
    class Meta:
        model = PanoramaMarker
        fields = ('panorama', 'linked_panorama', 'text', 'yaw', 'pitch', ) #'__all__'
        widgets = {
            'yaw': forms.NumberInput(attrs={'step': '0.01', 'class': 'coord-input'}),
            'pitch': forms.NumberInput(attrs={'step': '0.01', 'class': 'coord-input'}),
        }

class MarkerInline(admin.TabularInline):
    model = PanoramaMarker
    fk_name = 'panorama'
    form = MarkerForm
    extra = 0
    fields = ('linked_panorama', 'text', 'yaw', 'pitch', )
    readonly_fields = ()


@admin.register(Panorama)
class PanoramaAdmin(admin.ModelAdmin):
    inlines = [MarkerInline]
    list_display = ('title', 'admin_image_preview')
    readonly_fields = ('admin_image_preview',)


    def admin_image_preview(self, obj):
        if obj.image:
            return mark_safe(
                f'<div class="panorama-container">'
                f'<img src="{obj.image.url}" class="panorama-image">'
                f'</div>'
            )
        return "Изображение не загружено"


    class Media:
        css = {'all': ('admin/css/panorama_admin.css',)}
        js = ('admin/js/panorama_admin.js',)


class PanoramaMarkerAdmin(admin.ModelAdmin):
    def add_view(self, request, form_url='', extra_context=None):
        if 'panorama' in request.GET:
            # Предзаполняем поле panorama в форме
            request.session['prefilled_panorama'] = request.GET['panorama']
            return HttpResponseRedirect(
                reverse('admin:your_app_panoramamarker_add') + f'?panorama={request.GET["panorama"]}'
            )
        return super().add_view(request, form_url, extra_context)

@admin.register(Subscriber)
class SubscriberAdmin(admin.ModelAdmin):
    # Поля, которые будут отображаться в списке записей
    list_display = ('name', 'email', 'ip_address', 'created_at')
    
    # Поля, по которым можно фильтровать записи
    list_filter = ('created_at',)
    
    # Поля, по которым можно искать
    search_fields = ('name', 'email', 'ip_address')
    
    # Поля, которые нельзя редактировать (все, кроме возможности удалить)
    readonly_fields = ('name', 'email', 'ip_address', 'created_at')
    
    # Отключаем возможность добавления новых записей (если нужно)
    def has_add_permission(self, request):
        return False
    
    # Разрешаем удаление записей
    def has_delete_permission(self, request, obj=None):
        return True

