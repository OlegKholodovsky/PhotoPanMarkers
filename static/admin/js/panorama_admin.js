document.addEventListener('DOMContentLoaded', function() {
    const panoramaImg = document.querySelector('.panorama-image');
    if (!panoramaImg) return;

    panoramaImg.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Нормализация координат (0-360°, -90°-90°)
        const longitude = (x / rect.width) * 360;
        const latitude = 90 - (y / rect.height) * 180;
        
        addMarkerForm(longitude.toFixed(2), latitude.toFixed(2));
    });

    function addMarkerForm(longitude, latitude) {
        const addButton = document.querySelector('.add-row a');
        if (addButton) {
            addButton.click();
            setTimeout(() => {
                const forms = document.querySelectorAll('.dynamic-panoramamarker_set');
                const lastForm = forms[forms.length - 1];
                lastForm.querySelector('input[name$="-longitude"]').value = longitude;
                lastForm.querySelector('input[name$="-latitude"]').value = latitude;
            }, 100);
        }
    }
});

