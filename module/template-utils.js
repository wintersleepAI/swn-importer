import { SectorData } from './model/sector-data.js';
import { Utils } from './utils.js';

export class TemplateUtils {

    /**
     * Renders the data on the appropiate template for the entity type
     * @param type The entity type to select a template
     * @param data The data for the template
     * @returns The template rendered with the provided data (promise)
     */
    static async renderJournalContent(type, data) {
        const path = TemplateUtils.getTemplatePath(type);
        const content = await renderTemplate(path, data);
        return content;
    }

    static getTemplatePath(type) {
        if (type === 'sector') {
            return Utils.getTemplatePath("sector.html");
        } else {
            return Utils.getTemplatePath("entity.html");
        }
    }

}
