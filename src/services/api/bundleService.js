import mockBundles from '@/services/mockData/bundles.json'

class BundleService {
  constructor() {
    this.bundles = [...mockBundles]
    this.nextId = Math.max(...this.bundles.map(b => b.Id)) + 1
  }

  async getAll() {
    return [...this.bundles]
  }

  async getById(id) {
    const bundle = this.bundles.find(b => b.Id === parseInt(id))
    if (!bundle) {
      throw new Error(`Bundle with ID ${id} not found`)
    }
    return { ...bundle }
  }

  async create(bundleData) {
    const newBundle = {
      ...bundleData,
      Id: this.nextId++,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    this.bundles.push(newBundle)
    return { ...newBundle }
  }

  async update(id, bundleData) {
    const index = this.bundles.findIndex(b => b.Id === parseInt(id))
    if (index === -1) {
      throw new Error(`Bundle with ID ${id} not found`)
    }

    this.bundles[index] = {
      ...this.bundles[index],
      ...bundleData,
      Id: parseInt(id),
      updatedAt: new Date().toISOString()
    }

    return { ...this.bundles[index] }
  }

  async delete(id) {
    const index = this.bundles.findIndex(b => b.Id === parseInt(id))
    if (index === -1) {
      throw new Error(`Bundle with ID ${id} not found`)
    }

    this.bundles.splice(index, 1)
    return true
  }

  async duplicateBundle(id, newTitle) {
    const originalBundle = await this.getById(id)
    const duplicatedBundle = {
      ...originalBundle,
      Id: this.nextId++,
      title: newTitle || `${originalBundle.title} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.bundles.push(duplicatedBundle)
    return { ...duplicatedBundle }
  }
}

export const bundleService = new BundleService()