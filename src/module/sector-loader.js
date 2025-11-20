import { Constants } from './constants';
import { FolderUtils } from './folder-utils';
import { JournalUtils } from './journal-utils';
import { Options } from './model/options';
import { SectorData } from './model/sector-data';
import { SectorTree } from './model/sector-tree';
import { SceneUtils } from './scene-utils';
import { Utils } from './utils';

export class SectorLoader {
    constructor(sectorData, options) {
        this.sectorData = sectorData;
        this.options = options;
    }

    /**
     * Imports the sector data into Foundry and return it
     * @returns The sector tree
     */
    async import() {
        const nodeMap = Utils.getDataAsNodeMap(this.sectorData);
        const tagMap = Utils.getTagMap(Utils.getValueList(nodeMap));
        Utils.linkTreeNodes(nodeMap);

        for (const node of nodeMap.values()) {
            if (node.type === 'sector') {
                const tree = { nodeMap, tagMap, root: node };
                await this.importIntoFoundry(tree);
                return tree;
            }
        }

        throw new Error("The sector data could not be processed");
    }

    async importIntoFoundry(sectorTree) {
        await this.createSectorFolder(sectorTree);
        await this.createTagJournals(sectorTree);
        await this.createSystemFolders(sectorTree);
        await this.createEntityJournals(sectorTree);
        await this.updateJournalContents(sectorTree);
        await this.createScene(sectorTree);
    }

    async createSectorFolder(sectorTree) {
        const folder = await Folder.create(FolderUtils.getFolderData(sectorTree.root, this.options, true));

        if (folder) {
            sectorTree.root.folder = folder;
        } else {
            throw new Error("Could not create a folder for the sector");
        }
    }

    async createTagJournals(sectorTree) {
        const tagFolder = await Folder.create({
            name: "Tags",
            type: "JournalEntry",
            parent: sectorTree.root.folder?.id
        });
        const journalDataPromises = Utils.getValueList(sectorTree.tagMap).map(node => JournalUtils.getTagJournalData(node, tagFolder));
        const journalData = await Promise.all(journalDataPromises);
        const journalEntries = await Promise.all(journalData.map(d => JournalEntry.create(d)));
        Utils.getAsList(journalEntries).forEach(e => {
            const tag = sectorTree.tagMap.get(Utils.getIdFlag(e));
            if (tag && e) {
                tag.journal = e;
                tag.displayTag.link = e.link;
            }
        });
    }

    async createSystemFolders(sectorTree) {
        const folderData = [];
        sectorTree.root.children.forEach(node => {
            if (node.type !== 'note') {
                folderData.push(FolderUtils.getFolderData(node, this.options, false));
            }
        });

        const folders = Utils.getAsList(await Promise.all(folderData.map(f => Folder.create(f))));
        folders.forEach(folder => {
            const entityId = Utils.getIdFlag(folder);
            const node = sectorTree.nodeMap.get(entityId);
            if (node) {
                node.folder = folder;
            }
        });
    }

    async createEntityJournals(sectorTree) {
        const journalData = [];
        sectorTree.nodeMap.forEach(node => {
            if (node.type !== 'note') {
                journalData.push(JournalUtils.getEmptyJournalData(node, this.options));
            }
        });

        const journals = Utils.getAsList(await Promise.all(journalData.map(j => JournalEntry.create(j))));
        journals.forEach(journal => {
            const entityId = Utils.getIdFlag(journal);
            const node = sectorTree.nodeMap.get(entityId);
            if (node) {
                node.journal = journal;
            }
        });
    }

    async updateJournalContents(sectorTree) {
        const journalData = [];

        for (const node of sectorTree.nodeMap.values()) {
            if (node.type !== 'note') {
                journalData.push(await JournalUtils.getUpdateJournalData(sectorTree, node, this.options));
            }
        }

        await JournalEntry.updateDocuments(journalData);
    }

    async createScene(sectorTree) {
        const scene = await Scene.create(SceneUtils.getSceneData(sectorTree, this.options));
        if (scene) {
            const thumbnail = await scene.createThumbnail({ img: Constants.BACKGROUND_COLOR });
            await scene.update({ thumb: thumbnail }, {});
        } else {
            throw new Error("Couldn't create the scene");
        }
    }

}
