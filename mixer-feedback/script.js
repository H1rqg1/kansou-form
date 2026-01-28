document.addEventListener('DOMContentLoaded', () => {
    // Star Rating Logic
    const stars = document.querySelectorAll('.stars i');
    const satisfactionInput = document.getElementById('satisfaction');
    const ratingText = document.getElementById('ratingText');
    const ratingContainer = document.querySelector('.rating-container');

    const ratingMessages = {
        1: "不満",
        2: "やや不満",
        3: "普通",
        4: "満足",
        5: "大変満足"
    };

    let currentRating = 0;

    stars.forEach(star => {
        // Hover effect
        star.addEventListener('mouseover', function () {
            const value = parseInt(this.getAttribute('data-value'));
            highlightStars(value);
            ratingText.textContent = ratingMessages[value];
            ratingText.style.color = "#fff";
        });

        // Click to select
        star.addEventListener('click', function () {
            currentRating = parseInt(this.getAttribute('data-value'));
            satisfactionInput.value = currentRating;
            highlightStars(currentRating);

            // Add pulse animation
            this.style.transform = "scale(1.3)";
            setTimeout(() => {
                this.style.transform = "scale(1.1)";
            }, 200);
        });
    });

    // Reset on mouse leave (if not selected)
    const starContainer = document.getElementById('starContainer');
    starContainer.addEventListener('mouseleave', function () {
        if (currentRating > 0) {
            highlightStars(currentRating);
            ratingText.textContent = ratingMessages[currentRating];
        } else {
            resetStars();
            ratingText.textContent = "選択してください";
            ratingText.style.color = "var(--text-muted)";
        }
    });

    function highlightStars(value) {
        stars.forEach(star => {
            const starValue = parseInt(star.getAttribute('data-value'));
            if (starValue <= value) {
                star.classList.remove('fa-regular');
                star.classList.add('fa-solid');
                star.classList.add('active');
            } else {
                star.classList.remove('fa-solid');
                star.classList.remove('active');
                star.classList.add('fa-regular');
            }
        });
    }

    function resetStars() {
        stars.forEach(star => {
            star.classList.remove('fa-solid');
            star.classList.remove('active');
            star.classList.add('fa-regular');
        });
    }

    // ========== Admin Mode Logic ==========
    const ADMIN_PASSWORD = "IPUTEXCOiecZ1MKK";
    const SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/18dlXrMzdWa_-ArmJ5ODcB2UxhZZjFeY6x-QBnbzbTxI/edit?usp=sharing";
    const MAX_ATTEMPTS = 3;
    let attemptCount = 0;
    let isLocked = false;
    // let isAdminMode = false; // Admin mode state is no longer needed for UI changes

    const adminBtn = document.getElementById('adminBtn');
    const adminModal = document.getElementById('adminModal');
    const adminPassword = document.getElementById('adminPassword');
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const adminCancelBtn = document.getElementById('adminCancelBtn');
    const attemptWarning = document.getElementById('attemptWarning');
    const adminModalMessage = document.getElementById('adminModalMessage');

    // Check if locked (persist across page reloads)
    if (localStorage.getItem('admin_locked')) {
        isLocked = true;
    }

    // Open admin modal
    adminBtn.addEventListener('click', () => {
        // Always open modal to ask for password (or show lock)
        // No toggle logic needed since we don't stay in "Admin Mode"

        if (isLocked) {
            adminModalMessage.textContent = "ロックされています";
            attemptWarning.textContent = "試行回数の上限に達しました";
            attemptWarning.classList.add('error');
            adminPassword.disabled = true;
            adminLoginBtn.disabled = true;
        } else {
            adminModalMessage.textContent = "パスワードを入力してください";
            attemptWarning.textContent = "";
            attemptWarning.classList.remove('error');
            adminPassword.disabled = false;
            adminLoginBtn.disabled = false;
            adminPassword.value = "";
        }

        adminModal.classList.add('show');
        if (!isLocked) {
            adminPassword.focus();
        }
    });

    // Admin login attempt
    adminLoginBtn.addEventListener('click', tryAdminLogin);

    // Enter key to submit
    adminPassword.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !isLocked) {
            tryAdminLogin();
        }
    });

    function tryAdminLogin() {
        if (isLocked) return;

        const inputPassword = adminPassword.value;

        if (inputPassword === ADMIN_PASSWORD) {
            // Success
            window.open(SPREADSHEET_URL, '_blank');
            adminModal.classList.remove('show');
            attemptCount = 0;
            adminPassword.value = ""; // Clear password
        } else {
            // Wrong password
            attemptCount++;
            adminPassword.classList.add('error');
            setTimeout(() => adminPassword.classList.remove('error'), 500);
            adminPassword.value = "";

            const remaining = MAX_ATTEMPTS - attemptCount;

            if (remaining <= 0) {
                // Lock out
                isLocked = true;
                localStorage.setItem('admin_locked', 'true');
                adminPassword.disabled = true;
                adminLoginBtn.disabled = true;
                attemptWarning.textContent = "試行回数の上限に達しました。ロックされました。";
                attemptWarning.classList.add('error');
            } else {
                attemptWarning.textContent = `パスワードが違います（残り${remaining}回）`;
            }
        }
    }

    // enterAdminMode and exitAdminMode functions are removed as they are no longer needed

    // Cancel admin modal
    adminCancelBtn.addEventListener('click', () => {
        adminModal.classList.remove('show');
    });

    // Close modal when clicking outside
    adminModal.addEventListener('click', (e) => {
        if (e.target === adminModal) {
            adminModal.classList.remove('show');
        }
    });

    // ========== End of Admin Mode Logic ==========

    // Check if already submitted - REMOVED to allow multiple submissions
    // if (localStorage.getItem('mixer_feedback_submitted')) { ... }

    // Form Submission Logic
    const form = document.getElementById('feedbackForm');
    const submitBtn = document.getElementById('submitBtn');
    const successModal = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModalBtn');

    // REPLACE THIS WITH YOUR DEPLOYED GOOGLE APPS SCRIPT URL
    // 例: https://script.google.com/macros/s/AKfycbx.../exec
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyvA7wzbznnrW5nAH90TYQfmzZqrKXJaOKL6GfJpqBE-oSDqPSnv89XOIjFTuC7HdjkCg/exec";

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Basic validation for rating
        if (!satisfactionInput.value) {
            alertRatingError();
            return;
        } else {
            ratingContainer.style.borderColor = "var(--glass-border)";
        }

        // Check if URL is set
        if (SCRIPT_URL === "YOUR_SCRIPT_URL_HERE" || SCRIPT_URL === "") {
            alert("システムエラー: 送信先URLが設定されていません。管理者に連絡してください。");
            return;
        }

        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // Collect form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Send to Google Apps Script
        // Use text/plain to avoid CORS preflight (OPTIONS) triggers effectively with GAS
        fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(data)
            // implicitly Content-Type: text/plain if not set, 
            // or we can set it explicitly to be safe: 'Content-Type': 'text/plain;charset=utf-8'
        })
            .then(response => response.json()) // Now we can parse the JSON!
            .then(response => {
                if (response.result === "success") {
                    // Success
                    // localStorage.setItem('mixer_feedback_submitted', 'true'); // Don't block future submissions
                    showSuccess();
                } else {
                    // Other error
                    // Other error
                    console.error("Server Error:", response);
                    alert("送信エラーが発生しました。\n詳細: " + JSON.stringify(response));
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert("送信に失敗しました。ネットワーク接続を確認してもう一度お試しください。");
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            });
    });

    function alertRatingError() {
        ratingContainer.style.borderColor = "#ef4444";
        ratingText.textContent = "評価を選択してください";
        ratingText.style.color = "#ef4444";
        ratingContainer.style.animation = "shake 0.5s ease";
        setTimeout(() => {
            ratingContainer.style.animation = "";
        }, 500);
    }

    function showSuccess() {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;

        // Show success modal
        successModal.classList.add('show');

        // Reset form
        form.reset();
        resetStars();
        currentRating = 0;
        ratingText.textContent = "選択してください";
        ratingText.style.color = "var(--text-muted)";
    }

    // Close Modal
    closeModalBtn.addEventListener('click', () => {
        // ブラウザを閉じることを試みる
        window.close();
        // セキュリティ制限で閉じられない場合のために、モーダルも非表示にする
        successModal.classList.remove('show');
        // ユーザーへの案内が必要な場合は、ここにalertなどを追加できます
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === successModal) {
            successModal.classList.remove('show');
        }
    });

    // Add styles for shake animation
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);
});
