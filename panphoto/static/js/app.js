class PanoramaViewer {

    constructor() {
        if (typeof PhotoSphereViewer === 'undefined') {
            throw new Error('Photo Sphere Viewer library not loaded. Please include required scripts in head section.');
        }
        
        this.viewer = null;
        this.history = [];
        this.cache = new Map();
        this.initViewer();
    }

    getColoredSvg(color) {
        return `data:image/svg+xml;utf8,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="25" fill="${color}" height="41" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
            </svg>
        `)}`;
    }  

    async initViewer(initialPanoramaId = 5) {
        const { panorama, markers } = await this.fetchPanoramaData(initialPanoramaId);
        this.showLoader();
        
        if (this.viewer) {
            this.viewer.destroy();
        }

        this.viewer = new PhotoSphereViewer.Viewer({
            container: document.querySelector('#viewer-container'),
            panorama: panorama.image.url,
            /*
            touchmoveTwoFingers: true,
            mousewheelCtrlKey: true,
            */
            plugins: [
                [PhotoSphereViewer.MarkersPlugin, {
                    markers: this.prepareMarkers(markers),
                    clickEventOnMarker: true,
                    hoverEventOnMarker: true,
                }]
            ]
        });

        this.viewer.on('ready', () => {
            this.hideLoader();
            this.history.push(initialPanoramaId);
            const markersPlugin = this.viewer.getPlugin('markers');


            markersPlugin.on('select-marker', async (e, marker) => {
                if (marker.data.linkedPanoramaId) {
                    await this.handleMarkerClick(marker);
                }
            });

            /*
                        // Стандартное событие при наведении
            markersPlugin.on('over-marker',  async (e, marker) => {
                markersPlugin.updateMarker({
                                    ...marker.config,
                                    id: `${marker.id}`,
                                    image: this.getColoredSvg('blue')                    
                });


            });
            

            // Событие при уходе курсора
            markersPlugin.on('leave-marker', async (e, marker) => {
                markersPlugin.updateMarker({
                                    ...marker.config,
                                    id: `${marker.id}`,
                                    image: this.getColoredSvg(marker.config.color)                    
                });
            });
            */


        })
    }

    prepareMarkers(markers) {
        return markers.map(marker => ({
            id: `marker-${marker.id}`,
            longitude: `${marker.longitude}deg`,
            latitude: `${marker.latitude}deg`,
            color: marker.color,
            image: this.getColoredSvg(marker.color),
            width: marker.width,
            height: marker.height,
            anchor: 'center center', 
            tooltip: {
                content: `${marker.tooltip.content}`,
                position: 'top center',
            },
            data: {
                linkedPanoramaId: marker.data.linkedPanoramaId
            },
            renderer: {
                canvas: true,
                width: marker.width,
                height: marker.height,
                autoUpdate: true
            }
        }));
    }

    async handleMarkerClick(marker) {
        try {
            // this.smoothTransition(marker);
            await this.loadNewPanorama(marker.data.linkedPanoramaId);
        } catch (error) {
            console.error('Ошибка перехода:', error);
            this.hideLoader();
        }
    }

    async smoothTransition(marker) {
        // Анимация приближения
        await this.viewer.animate({
            longitude: marker.longitude,
            latitude: marker.latitude,
            zoom: 80,
            speed: '8rpm'
        });

        // Эффект затемнения
        const overlay = document.querySelector('.transition-overlay');
        overlay.style.transition = 'opacity 0.8s';
        overlay.style.opacity = 1;
        await new Promise(resolve => setTimeout(resolve, 800));
    }

    async loadNewPanorama(panoramaId) {
        this.showLoader();
        
        try {
            const { panorama, markers } = await this.fetchPanoramaData(panoramaId);
            
            this.viewer.setPanorama(panorama.image.url, {
                longitude: 0,
                latitude: 0,
                zoom: 50
            });
            
            this.viewer.getPlugin('markers').setMarkers(this.prepareMarkers(markers));
            
            this.history.push(panoramaId);
        } finally {
            const overlay = document.querySelector('.transition-overlay');
            overlay.style.opacity = 0;
            this.hideLoader();
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

    showLoader() {
        document.querySelector('.loader').style.display = 'block';
    }

    hideLoader() {
        document.querySelector('.loader').style.display = 'none';
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new PanoramaViewer();
});