class NotificationService {
  private static instance: NotificationService;
  // private notificationDuration;

  // private constructor(duration: number) {
  //   this.notificationDuration = duration;
  // }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public showNotification(
    message: string,
    type: "success" | "error" | "info" = "info"
  ) {
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
