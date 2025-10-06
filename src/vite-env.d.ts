    /// <reference types="vite/client" />

    interface ImportMetaEnv {
    readonly VITE_EARTHDATA_TOKEN?: string;
    readonly VITE_DEFAULT_CITY?: string;
    readonly VITE_DEFAULT_LAT?: string;
    readonly VITE_DEFAULT_LON?: string;
    }

    interface ImportMeta {
    readonly env: ImportMetaEnv;
    }
