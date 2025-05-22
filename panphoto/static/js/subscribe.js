document.getElementById('subscribe-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Сброс ошибок
    document.getElementById('name-error').style.display = 'none';
    document.getElementById('email-error').style.display = 'none';
    
    // Получение данных формы
    const formData = new FormData(this);
    
    // AJAX-запрос
    fetch('/subscribe/', {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Успешная подписка
            document.getElementById('subscribe-form').reset();
            const successMsg = document.getElementById('success-message');
            successMsg.textContent = data.message;
            successMsg.style.display = 'block';
            
            // Скрываем сообщение через 5 секунд
            setTimeout(() => {
                successMsg.style.display = 'none';
            }, 5000);
        } else {
            // Ошибки валидации
            if (data.errors.name) {
                const nameError = document.getElementById('name-error');
                nameError.textContent = data.errors.name[0];
                nameError.style.display = 'block';
            }
            if (data.errors.email) {
                const emailError = document.getElementById('email-error');
                emailError.textContent = data.errors.email[0];
                emailError.style.display = 'block';
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

