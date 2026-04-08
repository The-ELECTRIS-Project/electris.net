import { browser } from '$app/environment';

export interface CookieInfo {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: string;
}

export function getAllCookies(): CookieInfo[] {
  if (!browser) return [];
  
  return document.cookie
    .split(';')
    .map(cookie => cookie.trim())
    .filter(cookie => cookie.length > 0)
    .map(cookie => {
      const [nameValue] = cookie.split(';');
      const [name, ...valueParts] = nameValue.split('=');
      const value = valueParts.join('=');
      
      return {
        name: name.trim(),
        value: value || '',
        domain: window.location.hostname,
        path: '/'
      };
    });
}

export function deleteCookie(name: string, domain?: string, path: string = '/'): void {
  if (!browser) return;
  
  const domains = domain ? [domain] : [
    window.location.hostname,
    `.${window.location.hostname}`,
    'electris.net',
    '.electris.net',
    'localhost'
  ];
  
  const paths = [path, '/'];
  
  domains.forEach(d => {
    paths.forEach(p => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${d}; path=${p}`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${p}`;
    });
  });
}

export function deleteAllCookies(): { deleted: string[], failed: string[] } {
  if (!browser) return { deleted: [], failed: [] };
  
  const cookies = getAllCookies();
  const deleted: string[] = [];
  const failed: string[] = [];
  
  cookies.forEach(cookie => {
    try {
      deleteCookie(cookie.name, cookie.domain, cookie.path);

      if (!document.cookie.includes(`${cookie.name}=`)) {
        deleted.push(cookie.name);
      } else {
        failed.push(cookie.name);
      }
    } catch {
      failed.push(cookie.name);
    }
  });
  
  return { deleted, failed };
}

export function getCookieCount(): number {
  return getAllCookies().length;
}

export interface LocalStorageInfo {
  key: string;
  value: string;
  size: number;
}

export function getAllLocalStorageItems(): LocalStorageInfo[] {
  if (!browser) return [];
  
  const items: LocalStorageInfo[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key) || '';
      items.push({
        key,
        value,
        size: value.length
      });
    }
  }
  
  return items.sort((a, b) => a.key.localeCompare(b.key));
}

export function deleteLocalStorageItem(key: string): boolean {
  if (!browser) return false;
  
  try {
    localStorage.removeItem(key);
    return !localStorage.getItem(key);
  } catch (error) {
    console.warn('Failed to delete localStorage item:', error);
    return false;
  }
}

export function clearAllLocalStorage(): { deleted: string[], failed: string[] } {
  if (!browser) return { deleted: [], failed: [] };
  
  const items = getAllLocalStorageItems();
  const deleted: string[] = [];
  const failed: string[] = [];
  
  items.forEach(item => {
    try {
      localStorage.removeItem(item.key);
      if (!localStorage.getItem(item.key)) {
        deleted.push(item.key);
      } else {
        failed.push(item.key);
      }
    } catch {
      failed.push(item.key);
    }
  });
  
  return { deleted, failed };
}

export function getLocalStorageCount(): number {
  return getAllLocalStorageItems().length;
}

export function getLocalStorageTotalSize(): number {
  if (!browser) return 0;
  
  let totalSize = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key) || '';
      totalSize += key.length + value.length;
    }
  }
  
  return totalSize;
}

export function resetAllStates(): { 
  cookies: { deleted: string[], failed: string[] },
  localStorage: { deleted: string[], failed: string[] }
} {
  const cookieResult = deleteAllCookies();
  const localStorageResult = clearAllLocalStorage();
  
  return {
    cookies: cookieResult,
    localStorage: localStorageResult
  };
}

export function resetPinsGrid(): boolean {
  if (!browser) return false;
  
  try {
    localStorage.removeItem('newhome-pins');
    return !localStorage.getItem('newhome-pins');
  } catch (error) {
    console.warn('Failed to reset pins grid:', error);
    return false;
  }
}
