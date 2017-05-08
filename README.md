# Ti.MultipleAARmodule

## Problem
Android uses `res` folders to save assets like strings, layouts, drawables etc. During compile time the system generates `R.class` for referencing this resources from class file. This class is addressed by PACKAGENAME.R.class. 
I.e. by using of cast framework from google the address is `com.google.android.gms.cast.R.class`.

In the current version of build process of Titanium modules the module can only use one R class (property `respackage` in manifest). Wirth this package you can embed more the one res folder.

### Patch of SDK

### Adding of AARs and Jars

