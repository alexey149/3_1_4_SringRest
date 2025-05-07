package web.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import web.model.Role;
import web.model.User;
import web.service.RoleService;
import web.service.UserService;

import javax.validation.Valid;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Controller
public class ViewController {

    private final UserService userService;
    private final RoleService roleService;

    @Autowired
    public ViewController(UserService userService, RoleService roleService) {
        this.userService = userService;
        this.roleService = roleService;
    }

    // Страницы
    @GetMapping("/")
    public String index(ModelMap model) {
        List<String> messages = new ArrayList<>();
        messages.add("Hello!");
        messages.add("I'm Spring Boot application");
        messages.add("5.2.0 version by sep'19 ");
        model.addAttribute("messages", messages);
        return "index";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/user")
    public String showUserInfo(Model model) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.getUserByUsername(auth.getName());
        model.addAttribute("user", user);
        return "user/userInfo";
    }

    @GetMapping("/admin")
    public String showAdminPanel(Model model) {
        model.addAttribute("users", userService.getAllUsers());
        model.addAttribute("roles", roleService.getAllRoles());
        return "admin/users";
    }

    @GetMapping("/admin/addNewUser")
    public String addNewUser(Model model) {
        model.addAttribute("user", new User());
        model.addAttribute("roles", roleService.getAllRoles());
        return "admin/addUser";
    }

    @GetMapping("/admin/updateInfo")
    public String updateUser(Model model, @RequestParam("userId") int userId) {
        User user = userService.getUserById(userId);
        model.addAttribute("user", user);
        model.addAttribute("roles", roleService.getAllRoles());
        return "admin/addUser";
    }

    // Обработчики форм
    @PostMapping("/admin/saveUser")
    public String createUser(@ModelAttribute("user") User user, BindingResult result,
                             @RequestParam(value = "selectedRoles", required = false) String[] selectedRoles,
                             Model model) {
        // Проверяем пароль для нового пользователя
        if (user.getId() == 0 && (user.getPassword() == null || user.getPassword().isEmpty())) {
            result.rejectValue("password", "error.user", "Password cannot be empty");
        }

        if (result.hasErrors()) {
            model.addAttribute("roles", roleService.getAllRoles());
            return "admin/addUser";
        }

        if (selectedRoles != null) {
            Set<Role> roles = new HashSet<>();
            for (String roleName : selectedRoles) {
                Role role = roleService.getRoleByName(roleName);
                if (role != null) {
                    roles.add(role);
                }
            }
            user.setRoles(roles);
        } else {
            // Если роли не выбраны, добавляем ROLE_USER по умолчанию
            Set<Role> roles = new HashSet<>();
            Role userRole = roleService.getRoleByName("ROLE_USER");
            if (userRole != null) {
                roles.add(userRole);
            }
            user.setRoles(roles);
        }

        userService.save(user);
        return "redirect:/admin";
    }

    @PostMapping("/admin/updateUser")
    public String updateUser(@ModelAttribute("user") User user, BindingResult result,
                             @RequestParam(value = "selectedRoles", required = false) String[] selectedRoles,
                             Model model) {
        // Если это обновление и пароль пустой, получаем существующий пароль
        if (user.getId() != 0 && (user.getPassword() == null || user.getPassword().isEmpty())) {
            User existingUser = userService.getUserById(user.getId());
            user.setPassword(existingUser.getPassword());
        } else {
            // Иначе проверяем валидацию для нового пароля
            if (user.getPassword() == null || user.getPassword().isEmpty()) {
                result.rejectValue("password", "error.user", "Password cannot be empty");
            }
        }

        if (result.hasErrors()) {
            model.addAttribute("roles", roleService.getAllRoles());
            return "admin/addUser";
        }

        if (selectedRoles != null) {
            Set<Role> roles = new HashSet<>();
            for (String roleName : selectedRoles) {
                Role role = roleService.getRoleByName(roleName);
                if (role != null) {
                    roles.add(role);
                }
            }
            user.setRoles(roles);
        } else {
            // Если роли не выбраны, добавляем ROLE_USER по умолчанию
            Set<Role> roles = new HashSet<>();
            Role userRole = roleService.getRoleByName("ROLE_USER");
            if (userRole != null) {
                roles.add(userRole);
            }
            user.setRoles(roles);
        }

        userService.save(user);
        return "redirect:/admin";
    }

    @GetMapping("/admin/deleteUser")
    public String deleteUserForm(@RequestParam("userId") int id) {
        try {
            // Получаем пользователя и удаляем только по ID, игнорируя другие параметры запроса
            userService.delete(id);
        } catch (Exception e) {
            e.printStackTrace();
        }
        // Всегда перенаправляем на страницу администратора, независимо от результата
        return "redirect:/admin";
    }
}