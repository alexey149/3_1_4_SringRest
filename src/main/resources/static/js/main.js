$(document).ready(function() {
    // Загружаем информацию о текущем пользователе на странице пользователя
    if ($("#user-info").length) {
        loadCurrentUser();
    }

    // Обрабатываем создание и редактирование пользователя
    $(document).on('click', '#save-user', function(e) {
        e.preventDefault();
        saveUser();
    });

    // Открываем модальное окно для создания нового пользователя
    $(document).on('click', '#add-user-button', function() {
        clearUserForm();
        $('#userFormTitle').text('Добавление нового пользователя');
        $('#userForm').attr('data-mode', 'create');
        loadRoles();
        $('#userModal').modal('show');
    });

    // Открываем модальное окно для редактирования пользователя
    $(document).on('click', '.edit-button', function() {
        const userId = $(this).data('id');
        $('#userFormTitle').text('Редактирование пользователя');
        $('#userForm').attr('data-mode', 'edit');
        $('#userForm').attr('data-id', userId);
        loadUserForEdit(userId);
        $('#userModal').modal('show');
    });

    // Обрабатываем удаление пользователя
    $(document).on('click', '.delete-button', function() {
        const userId = $(this).data('id');
        if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            window.location.href = '/admin/deleteUser?userId=' + userId;
        }
    });
});

// Функция загрузки всех пользователей
function loadUsers() {
    $.ajax({
        url: '/api/users',
        type: 'GET',
        dataType: 'json',
        success: function(users) {
            if (users && users.length > 0) {
                let tbody = '';
                users.forEach(function(user) {
                    let rolesBadges = '';
                    if (user.roles && user.roles.length > 0) {
                        user.roles.forEach(function(role) {
                            if (role && role.name) {
                                rolesBadges += `<span class="badge badge-pill badge-primary">${role.name.replace('ROLE_', '')}</span> `;
                            }
                        });
                    }

                    tbody += `
                    <tr>
                        <td>${user.id || ''}</td>
                        <td>${user.name || ''}</td>
                        <td>${user.sureName || ''}</td>
                        <td>${user.username || ''}</td>
                        <td>${rolesBadges}</td>
                        <td>
                            <button class="btn btn-sm btn-warning edit-button" data-id="${user.id}">
                                <i class="bi bi-pencil-square"></i> Изменить
                            </button>
                            <button class="btn btn-sm btn-danger delete-button" data-id="${user.id}">
                                <i class="bi bi-trash"></i> Удалить
                            </button>
                        </td>
                    </tr>`;
                });

                $('#users-table tbody').html(tbody);
                $('#users-count').text(users.length + ' пользователей');
                $('#no-users').hide();
            } else {
                $('#users-table tbody').html('');
                $('#users-count').text('0 пользователей');
                $('#no-users').show();
            }
        },
        error: function(xhr, status, error) {
            $('#users-table tbody').html('');
            $('#no-users').show();
            showAlert('error', 'Ошибка загрузки пользователей: ' + (error || 'Неизвестная ошибка'));
        }
    });
}

// Функция загрузки информации о текущем пользователе
function loadCurrentUser() {
    $.ajax({
        url: '/api/user/current',
        type: 'GET',
        dataType: 'json',
        success: function(user) {
            if (user && user.id) {
                // Сначала очищаем все поля
                $('#user-roles-badges').empty();
                $('#user-roles-list').empty();

                // Заполняем данные профиля
                $('#user-name').text((user.name || '') + ' ' + (user.sureName || ''));
                $('#user-username').text(user.username || '');

                // Отображаем роли
                if (user.roles && user.roles.length > 0) {
                    let rolesList = '';

                    user.roles.forEach(function(role, index) {
                        if (role && role.name) {
                            // Добавляем бейджи ролей
                            $('#user-roles-badges').append(
                                `<div class="badge badge-pill badge-primary m-1">${role.name.replace('ROLE_', '')}</div>`
                            );

                            // Формируем текстовый список ролей
                            rolesList += role.name.replace('ROLE_', '');
                            if (index < user.roles.length - 1) {
                                rolesList += ', ';
                            }
                        }
                    });

                    $('#user-roles-list').text(rolesList);
                }

                // Заполняем таблицу с детальной информацией
                $('#user-id').text(user.id || '');
                $('#user-name-table').text(user.name || '');
                $('#user-surname').text(user.sureName || '');
                $('#user-username-table').text(user.username || '');

                // Показываем блок с информацией
                $('#user-info').show();
                $('#user-not-found').hide();
            } else {
                $('#user-info').hide();
                $('#user-not-found').show();
            }
        },
        error: function(xhr, status, error) {
            console.log("Ошибка загрузки пользователя:", error);
            console.log("Статус ответа:", xhr.status);
            console.log("Текст ответа:", xhr.responseText);

            $('#user-info').hide();
            $('#user-not-found').show();
            showAlert('error', 'Ошибка загрузки информации о пользователе: ' + (error || 'Неизвестная ошибка'));
        }
    });
}

// Функция загрузки всех ролей
function loadRoles() {
    $.ajax({
        url: '/api/roles',
        type: 'GET',
        dataType: 'json',
        success: function(roles) {
            if (roles && roles.length > 0) {
                let rolesHtml = '';
                roles.forEach(function(role) {
                    if (role && role.id && role.name) {
                        rolesHtml += `
                        <div class="custom-control custom-checkbox">
                            <input type="checkbox" class="custom-control-input role-checkbox" id="role_${role.id}" value="${role.name}">
                            <label class="custom-control-label" for="role_${role.id}">${role.name.replace('ROLE_', '')}</label>
                        </div>`;
                    }
                });

                $('#roles-container').html(rolesHtml);
            } else {
                $('#roles-container').html('<div class="alert alert-warning">Роли не найдены</div>');
            }
        },
        error: function(xhr, status, error) {
            $('#roles-container').html('<div class="alert alert-danger">Ошибка загрузки ролей</div>');
            showAlert('error', 'Ошибка загрузки ролей: ' + (error || 'Неизвестная ошибка'));
        }
    });
}

// Функция загрузки пользователя для редактирования
function loadUserForEdit(userId) {
    if (!userId) {
        showAlert('error', 'Не указан ID пользователя');
        $('#userModal').modal('hide');
        return;
    }

    $.ajax({
        url: '/api/users/' + userId,
        type: 'GET',
        dataType: 'json',
        success: function(user) {
            if (user && user.id) {
                $('#userId').val(user.id);
                $('#name').val(user.name || '');
                $('#surname').val(user.sureName || '');
                $('#username').val(user.username || '');
                $('#password').val(''); // Не отображаем пароль по соображениям безопасности

                // Загружаем роли
                loadRoles();

                // Отмечаем выбранные роли с небольшой задержкой, чтобы роли успели загрузиться
                setTimeout(function() {
                    if (user.roles && user.roles.length > 0) {
                        user.roles.forEach(function(role) {
                            if (role && role.name) {
                                $(`input[value="${role.name}"]`).prop('checked', true);
                            }
                        });
                    }
                }, 500);
            } else {
                showAlert('error', 'Пользователь не найден');
                $('#userModal').modal('hide');
            }
        },
        error: function(xhr, status, error) {
            $('#userModal').modal('hide');
            showAlert('error', 'Ошибка загрузки пользователя: ' + (error || 'Неизвестная ошибка'));
        }
    });
}

// Функция сохранения пользователя (создание или обновление)
function saveUser() {
    // Получаем режим формы
    const formMode = $('#userForm').attr('data-mode');
    if (!formMode) {
        showAlert('error', 'Ошибка определения режима формы');
        return;
    }

    // Собираем данные формы
    const userId = formMode === 'edit' ? parseInt($('#userForm').attr('data-id'), 10) : 0;
    const name = $('#name').val().trim();
    const sureName = $('#surname').val().trim();
    const username = $('#username').val().trim();
    const password = $('#password').val();

    // Валидация формы
    if (!name) {
        showAlert('error', 'Пожалуйста, введите имя');
        return;
    }

    if (!sureName) {
        showAlert('error', 'Пожалуйста, введите фамилию');
        return;
    }

    if (!username) {
        showAlert('error', 'Пожалуйста, введите логин');
        return;
    }

    if (formMode === 'create' && !password) {
        showAlert('error', 'Пожалуйста, введите пароль');
        return;
    }

    // Собираем выбранные роли
    const selectedRoles = [];
    $('.role-checkbox:checked').each(function() {
        const roleName = $(this).val();
        if (roleName) {
            selectedRoles.push(roleName);
        }
    });

    // Создаем объект пользователя
    const user = {
        id: userId,
        name: name,
        sureName: sureName,
        username: username,
        password: password
    };

    // Определяем метод запроса
    const method = formMode === 'create' ? 'POST' : 'PUT';

    // Формируем параметры запроса с ролями
    const roleParam = selectedRoles.length > 0 ? selectedRoles.join(',') : '';

    // Отправляем запрос через REST API
    $.ajax({
        url: '/api/users' + (roleParam ? '?roles=' + roleParam : ''),
        type: method,
        contentType: 'application/json',
        data: JSON.stringify(user),
        success: function(response) {
            $('#userModal').modal('hide');

            if (formMode === 'create') {
                showAlert('success', 'Пользователь успешно создан');
            } else {
                showAlert('success', 'Пользователь успешно обновлен');
            }

            loadUsers();
        },
        error: function(xhr, status, error) {
            let errorMsg = 'Ошибка сохранения пользователя';

            try {
                const response = JSON.parse(xhr.responseText);
                if (response && response.message) {
                    errorMsg += ': ' + response.message;
                } else {
                    errorMsg += ': ' + (error || 'Неизвестная ошибка');
                }
            } catch (e) {
                errorMsg += ': ' + (error || 'Неизвестная ошибка');
            }

            showAlert('error', errorMsg);
        }
    });
}

// Функция удаления пользователя
function deleteUser(userId) {
    if (!userId) {
        showAlert('error', 'Не указан ID пользователя');
        return;
    }

    // Перенаправляем на серверный метод для удаления
    window.location.href = '/admin/deleteUser?userId=' + userId;
}

// Очистка формы пользователя
function clearUserForm() {
    $('#userId').val('');
    $('#name').val('');
    $('#surname').val('');
    $('#username').val('');
    $('#password').val('');

    // Очищаем контейнер ролей
    $('#roles-container').empty();
}

// Функция отображения уведомлений
function showAlert(type, message) {
    if (!message) {
        return;
    }

    const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
    const alertHtml = `
    <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>`;

    $('#alert-container').html(alertHtml);

    // Автоматически скрываем сообщение через 5 секунд
    setTimeout(function() {
        $('.alert').alert('close');
    }, 5000);
}