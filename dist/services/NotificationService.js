class NotificationService {
    static instance;
    // private notificationDuration;
    // private constructor(duration: number) {
    //   this.notificationDuration = duration;
    // }
    static getInstance() {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }
    showNotification(message, type = "info") {
        const notification = document.createElement("div");
        notification.className = `notification ${type}`;
        notification.textContent = message;
        // Append it to the body
        document.body.appendChild(notification);
        // Remove notification after a interval
        setTimeout(() => {
            notification.style.opacity = `0`;
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}
export default NotificationService;
//# sourceMappingURL=NotificationService.js.map