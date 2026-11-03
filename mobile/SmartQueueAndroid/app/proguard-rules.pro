# Proguard rules for SmartQueue Android
-keepattributes *Annotation*
-keepclassmembers class * {
    @androidx.room.* <methods>;
    @androidx.room.* <fields>;
}
-keep class io.socket.** { *; }
