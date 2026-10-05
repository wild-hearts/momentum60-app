import {rmSync} from 'node:fs';
for(const path of ['ios/App/App/public/songs','android/app/src/main/assets/public/songs'])rmSync(new URL(`../${path}`,import.meta.url),{recursive:true,force:true});
