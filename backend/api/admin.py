from django.contrib import admin

# Register your models here.

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ["name", "author, is_builtin"]
    list_filter = ["is_builtin", "author"]
    search_fields = ["name"]


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display    = ["title", "user"]
    list_filter     = ["user", "tags"]
    filter_horizontal = ["tags"]

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display    = ["name", "author", "due_date", "completed"]
    list_filter     = ["author", "completed", "tags"]
    search_fields   = ["name", "description"]
    filter_horizontal = ["tags"]