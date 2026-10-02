// ============================================================
// ELIXIR MEDICS - MAIN FRONTEND SCRIPT
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    // ========================================================
    // 1. ELEMENTS
    // ========================================================

    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");

    const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");
    const adminBtn = document.getElementById("adminBtn");

    const loginModal = document.getElementById("loginModal");
    const signupModal = document.getElementById("signupModal");
    const adminModal = document.getElementById("adminModal");

    const adminPanel = document.getElementById("adminPanel");
    const memberUI = document.getElementById("memberUI");


    // ========================================================
    // 2. HELPER FUNCTIONS
    // ========================================================

    function openModal(modal) {
        if (modal) {
            modal.style.display = "block";
        }
    }

    function closeModal(modal) {
        if (modal) {
            modal.style.display = "none";
        }
    }

    function getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem("currentUser"));
        } catch (error) {
            return null;
        }
    }

    function getToken() {
        return localStorage.getItem("token");
    }


    // ========================================================
    // 3. CLOSE ALL DASHBOARDS
    // ========================================================

    function closeDashboards() {

        if (adminPanel) {
            adminPanel.style.display = "none";
        }

        if (memberUI) {
            memberUI.style.display = "none";
        }
    }


    // ========================================================
    // 4. SHOW ADMIN DASHBOARD
    // ========================================================

    function showAdminDashboard() {

        closeDashboards();

        if (adminPanel) {
            adminPanel.style.display = "block";
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    // ========================================================
    // 5. SHOW MEMBER DASHBOARD
    // ========================================================

    function showMemberDashboard(user) {

        closeDashboards();

        if (!memberUI) {
            console.error("Member Dashboard (#memberUI) was not found.");
            return;
        }

        memberUI.style.display = "block";

        // Member name
        const memberWelcomeName =
            document.getElementById("memberWelcomeName");

        if (memberWelcomeName) {
            memberWelcomeName.textContent =
                user.fullName || "Member";
        }


        // Member email
        const memberProfileEmail =
            document.getElementById("memberProfileEmail");

        if (memberProfileEmail) {
            memberProfileEmail.textContent =
                user.email || "Not available";
        }


        // Member department
        const memberProfileDepartment =
            document.getElementById("memberProfileDepartment");

        if (memberProfileDepartment) {
            memberProfileDepartment.textContent =
                user.department || "Not available";
        }


        // Member year
        const memberProfileYear =
            document.getElementById("memberProfileYear");

        if (memberProfileYear) {
            memberProfileYear.textContent =
                user.year || "Not available";
        }


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    // ========================================================
    // 6. MEMBER SIGNUP
    // ========================================================

    if (signupForm) {

        signupForm.addEventListener("submit", async (e) => {

            e.preventDefault();

            const fullName =
                document.getElementById("memberName")?.value.trim();

            const email =
                document.getElementById("memberEmail")?.value.trim();

            const department =
                document.getElementById("memberDepartment")?.value.trim();

            const year =
                document.getElementById("memberYear")?.value.trim();

            const password =
                document.getElementById("memberPassword")?.value;

            const confirmPassword =
                document.getElementById("memberConfirmPassword")?.value;


            // Check password
            if (password !== confirmPassword) {

                alert("Passwords do not match. Please try again.");

                return;
            }


            // Basic validation
            if (!fullName || !email || !department || !year || !password) {

                alert("Please complete all required fields.");

                return;
            }


            try {

                const response = await fetch("/api/register", {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        fullName,
                        email,
                        department,
                        year,
                        password
                    })
                });


                const data = await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Registration failed."
                    );

                    return;
                }


                // Save token
                if (data.token) {
                    localStorage.setItem(
                        "token",
                        data.token
                    );
                }


                // Save user
                if (data.user) {
                    localStorage.setItem(
                        "currentUser",
                        JSON.stringify(data.user)
                    );
                }


                signupForm.reset();

                closeModal(signupModal);


                alert(
                    "Registration successful! Welcome to Elixir Medics."
                );


                // Automatically open Member Dashboard
                if (data.user) {
                    showMemberDashboard(data.user);
                }

            } catch (error) {

                console.error(
                    "Registration Error:",
                    error
                );

                alert(
                    "Network error. Please try again later."
                );
            }
        });
    }


    // ========================================================
    // 7. LOGIN - MEMBERS AND ADMINS
    // ========================================================

    if (loginForm) {

        loginForm.addEventListener("submit", async (e) => {

            e.preventDefault();


            const email =
                document.getElementById("loginEmail")?.value.trim();

            const password =
                document.getElementById("loginPassword")?.value;


            if (!email || !password) {

                alert(
                    "Please enter your email and password."
                );

                return;
            }


            try {

                const response = await fetch("/api/login", {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                });


                const data = await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Login failed."
                    );

                    return;
                }


                // =================================================
                // SAVE JWT TOKEN
                // =================================================

                if (data.token) {

                    localStorage.setItem(
                        "token",
                        data.token
                    );
                }


                // =================================================
                // SAVE USER INFORMATION
                // =================================================

                if (data.user) {

                    localStorage.setItem(
                        "currentUser",
                        JSON.stringify(data.user)
                    );
                }


                loginForm.reset();

                closeModal(loginModal);


                // =================================================
                // ROLE-BASED DASHBOARD
                // =================================================

                if (data.user.role === "admin") {

                    alert("Welcome Admin!");

                    showAdminDashboard(data.user);

                } else {

                    alert(
                        `Welcome back, ${
                            data.user.fullName || "Member"
                        }!`
                    );

                    showMemberDashboard(data.user);
                }


            } catch (error) {

                console.error(
                    "Login Error:",
                    error
                );

                alert(
                    "Network error. Please try again later."
                );
            }
        });
    }


    // ========================================================
    // 8. LOGIN BUTTON
    // ========================================================

    if (loginBtn && loginModal) {

        loginBtn.addEventListener("click", () => {

            openModal(loginModal);

        });
    }


    // ========================================================
    // 9. SIGNUP BUTTON
    // ========================================================

    if (signupBtn && signupModal) {

        signupBtn.addEventListener("click", () => {

            openModal(signupModal);

        });
    }


    // ========================================================
    // 10. ADMIN BUTTON
    // ========================================================

    if (adminBtn && adminModal) {

        adminBtn.addEventListener("click", () => {

            openModal(adminModal);

        });
    }


    // ========================================================
    // 11. CLOSE BUTTONS
    // ========================================================

    document.querySelectorAll(".close").forEach((closeBtn) => {

        closeBtn.addEventListener("click", (e) => {

            const activeModal =
                e.target.closest(".modal");

            if (activeModal) {

                closeModal(activeModal);
            }
        });
    });


    // ========================================================
    // 12. CLICK OUTSIDE MODAL TO CLOSE
    // ========================================================

    window.addEventListener("click", (e) => {

        if (e.target.classList?.contains("modal")) {

            e.target.style.display = "none";
        }
    });


    // ========================================================
    // 13. MEMBER DASHBOARD BUTTONS
    // ========================================================

    const memberResourcesBtn =
        document.getElementById("memberResourcesBtn");

    const memberAnnouncementsBtn =
        document.getElementById("memberAnnouncementsBtn");

    const memberCommitteesBtn =
        document.getElementById("memberCommitteesBtn");

    const memberConstitutionBtn =
        document.getElementById("memberConstitutionBtn");


    if (memberResourcesBtn) {

        memberResourcesBtn.addEventListener("click", () => {

            closeDashboards();

            const resourcesSection =
                document.getElementById("resources");

            if (resourcesSection) {

                resourcesSection.scrollIntoView({
                    behavior: "smooth"
                });
            }
        });
    }


    if (memberAnnouncementsBtn) {

        memberAnnouncementsBtn.addEventListener("click", () => {

            closeDashboards();

            const announcementsSection =
                document.getElementById("announcements");

            if (announcementsSection) {

                announcementsSection.scrollIntoView({
                    behavior: "smooth"
                });
            }
        });
    }


    if (memberCommitteesBtn) {

        memberCommitteesBtn.addEventListener("click", () => {

            closeDashboards();

            const committeesSection =
                document.getElementById("committees");

            if (committeesSection) {

                committeesSection.scrollIntoView({
                    behavior: "smooth"
                });
            }
        });
    }


    if (memberConstitutionBtn) {

        memberConstitutionBtn.addEventListener("click", () => {

            closeDashboards();

            const constitutionSection =
                document.getElementById("constitution");

            if (constitutionSection) {

                constitutionSection.scrollIntoView({
                    behavior: "smooth"
                });
            }
        });
    }


    // ========================================================
    // 14. MEMBER LOGOUT
    // ========================================================

    const memberLogoutBtn =
        document.getElementById("memberLogoutBtn");

    if (memberLogoutBtn) {

        memberLogoutBtn.addEventListener("click", () => {

            localStorage.removeItem("token");

            localStorage.removeItem("currentUser");

            closeDashboards();

            alert("You have been logged out.");

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }


    // ========================================================
    // 15. ADMIN LOGOUT
    // ========================================================

    const adminLogoutBtn =
        document.getElementById("adminLogoutBtn");

    if (adminLogoutBtn) {

        adminLogoutBtn.addEventListener("click", () => {

            localStorage.removeItem("token");

            localStorage.removeItem("currentUser");

            closeDashboards();

            alert("Admin logged out successfully.");

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }


    // ========================================================
    // 16. RESTORE SESSION AFTER PAGE REFRESH
    // ========================================================

    const savedUser = getCurrentUser();
    const savedToken = getToken();


    if (savedUser && savedToken) {

        if (savedUser.role === "admin") {

            showAdminDashboard(savedUser);

        } else {

            showMemberDashboard(savedUser);
        }
    }

});
