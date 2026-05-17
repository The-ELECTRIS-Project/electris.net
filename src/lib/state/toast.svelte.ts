
export interface ToastOptions {
  message: string;
  title?: string;
  icon?: string;
  duration?: number;
}

export interface Toast extends ToastOptions {
  id: number;
  duration: number;
}

class ToastState {
  toasts = $state<Toast[]>([]);
  private nextId = 0;

  show(options: ToastOptions) {
    const id = this.nextId++;
    const duration = options.duration ?? 2500; // Increased slightly for better readability if it has title/icon

    const newToast: Toast = {
      id,
      ...options,
      duration
    };

    this.toasts.push(newToast);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  remove(id: number) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
  }
}

export const toastState = new ToastState();

export const toast = {
  show: (message: string, options?: Omit<ToastOptions, 'message'>) => {
    toastState.show({ message, ...options });
  },
  success: (message: string, title?: string) => {
    toastState.show({ 
      message, 
      title, 
      icon: '/icons/buttons/share.svg', // Reusing share as a generic success for now, or could use another
      duration: 3000 
    });
  },
  error: (message: string, title?: string) => {
    toastState.show({ 
      message, 
      title, 
      // icon: '/icons/buttons/error.svg', // If it exists
      duration: 4000 
    });
  },
  info: (message: string, title?: string) => {
    toastState.show({ message, title, duration: 2500 });
  }
};
