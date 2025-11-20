export class TemplatePreloader {
    /**
     * Preload a set of templates to compile and cache them for fast access during rendering
     */
    static async preloadHandlebarsTemplates() {
        const templatePaths = [
            "modules/swn-importer/templates/dialog.html",
            "modules/swn-importer/templates/entity.html",
            "modules/swn-importer/templates/imagePicker.html",
            "modules/swn-importer/templates/notes.html",
            "modules/swn-importer/templates/sector.html",
            "modules/swn-importer/templates/tag.html",
            "modules/swn-importer/templates/tagLinks.html"
        ];
        return loadTemplates(templatePaths);
    }
}
