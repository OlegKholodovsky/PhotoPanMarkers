from django.http import JsonResponse
from .models import Panorama, PanoramaMarker
from django.shortcuts import get_object_or_404


def panorama_detail(request, pk):
    try:
        markers = []
        panorama = get_object_or_404(Panorama, id=pk)
        for marker in panorama.markers.all():
            markers.append({
                'id': marker.id,
                'position': {
                    'yaw': marker.yaw,
                    'pitch': marker.pitch,
                },
                'data': {
                    'linkedPanoramaId': marker.linked_panorama.id if marker.linked_panorama else None
                },
                'color': 'red',
                'width': 25,
                'height': 41,
                'anchor': 'center center',
                'tooltip': {
                        'content':  marker.text,
                        'position': 'top center',
                },
            })

        return JsonResponse({
            'panorama': {        
                'id': panorama.id,
                'title': panorama.title,
                'image': {
                    'url': panorama.image.url
                }
            },
            'markers': markers
        })
        
    except Panorama.DoesNotExist:
        return JsonResponse({'error': 'Panorama not found'}, status=404)