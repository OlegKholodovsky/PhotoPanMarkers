import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';

class PanoramaViewer {
    constructor() {
        if (typeof Viewer === 'undefined') {
            throw new Error('Photo Sphere Viewer library not loaded. Please include required scripts in head section.');
        }

        this.viewer = null;
        this.history = [];
        this.cache = new Map();
        

        this.initViewer();

    }






    async initViewer(initialPanoramaId = 5) {
        const { panorama, markers } = await this.fetchPanoramaData(initialPanoramaId);
        
        if (this.viewer) {
            this.viewer.destroy();
        }

        this.viewer = new Viewer({
            container: 'viewer',
            panorama: panorama.image.url,
            caption: panorama.title,

            plugins: [
                [MarkersPlugin, {
                    defaultHoverScale: true,
                    markers: this.prepareMarkers(markers),
                }],
            ],
        });

        const markersPlugin = this.viewer.getPlugin(MarkersPlugin);
        
        markersPlugin.addEventListener('select-marker', async({ marker }) => {
            if (marker.data.linkedPanoramaId) {
                    await this.handleMarkerClick(marker);
                }
        });
        

    }

    prepareMarkers(markers) {
        return markers.map(marker => ({
            id: `marker-${marker.id}`,
            // longitude: `${marker.longitude}deg`,
            // latitude: `${marker.latitude}deg`,
            position: marker.position,
            image: '/static/images/pin-blue.png',
            anchor: 'center center', 
            size: { width: 32, height: 32 },
            tooltip: {
                content: `${marker.tooltip.content}`,
                position: 'top center',
            },
            data: {
                linkedPanoramaId: marker.data.linkedPanoramaId
            },
        }));
    }

    async handleMarkerClick(marker) {
        try {
            await this.loadNewPanorama(marker.data.linkedPanoramaId);
        } catch (error) {
            console.error('Ошибка перехода:', error);
            this.hideLoader();
        }
    }

    async loadNewPanorama(panoramaId) {
        
        try {
            const { panorama, markers } = await this.fetchPanoramaData(panoramaId);
            
            this.viewer.setPanorama(panorama.image.url, {
                longitude: 0,
                latitude: 0,
                zoom: 50,
                caption: panorama.title,
            });

            
            this.viewer.getPlugin('markers').setMarkers(this.prepareMarkers(markers));
            
            this.history.push(panoramaId);
        } finally {
            // const overlay = document.querySelector('.transition-overlay');
            // overlay.style.opacity = 0;
            // this.hideLoader();
        }
    }

    async fetchPanoramaData(panoramaId) {
        if (this.cache.has(panoramaId)) {
            return this.cache.get(panoramaId);
        }

        const response = await fetch(`/api/panoramas/${panoramaId}/`);
        const data = await response.json();
        this.cache.set(panoramaId, data);
        return data;
    }


    hideLoader() {
        document.querySelector('.loader').style.display = 'none';
    }
}




// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new PanoramaViewer();
});


