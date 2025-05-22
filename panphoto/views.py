from django.shortcuts import render, get_object_or_404
from django.views.generic import TemplateView, View
from .models import Panorama
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .forms import SubscribeForm
from ipware import get_client_ip



# Create your views here.


class HomePageView(TemplateView):
    template_name = 'home.html'

class AboutPageView(TemplateView):
    template_name = 'about.html'


def panorama_view(request, panorama_id):
    panorama = get_object_or_404(
        Panorama.objects.prefetch_related('markers'),
        id=panorama_id
    )
    return render(request, 'view.html', {
        'panorama': panorama,
        'markers': panorama.markers.all()
    })

def test_panorama_view1(request, panorama_id):
    panorama = Panorama.objects.get(id=panorama_id)

    return render(request, 'test.html', {'panorama': panorama})



def test_panorama_view2(request, panorama_id):
    panorama = get_object_or_404(Panorama, id=panorama_id)
    markers = panorama.markers.all()
    return render(request, 'test2.html', {
        'panorama': panorama,
        'markers': markers
    })


def index(request):
    """
    Основное представление для главной страницы.
    Можно передать первую панораму или другие данные.
    """
    context = {
        'panoramas': Panorama.objects.all(), 
    }
    return render(request, 'index.html', context)


def index_new(request):
    """
    Основное представление для главной страницы.
    Можно передать первую панораму или другие данные.
    """
    context = {
        'panoramas': Panorama.objects.all(), 
    }
    return render(request, 'index_new.html', context)



@method_decorator(csrf_exempt, name='dispatch')
class SubscribeView(View):
    def post(self, request):
        form = SubscribeForm(request.POST)
        
        if form.is_valid():
            subscriber = form.save(commit=False)
            subscriber.ip_address = get_client_ip(request)[0]
            subscriber.save()
            return JsonResponse({
                'success': True,
                'message': 'Спасибо за подписку!'
            })
        else:
            return JsonResponse({
                'success': False,
                'errors': form.errors
            }, status=400)