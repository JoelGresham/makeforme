import styles from './Queue.module.css'

type QueueItem = {
  id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed'
  sketch?: string
  finalImage?: string
  materialCost?: number
  timeSpent?: number
  payment?: number
  customerName: string
  createdAt: string
}

export function Queue() {
  // This will come from your database later
  const queueItems: QueueItem[] = [
    {
      id: '1',
      title: 'Custom Coffee Table',
      description: 'Walnut coffee table with curved legs and glass inlay',
      status: 'in-progress',
      sketch: '/api/placeholder/200/200',
      materialCost: 350,
      timeSpent: 12,
      customerName: 'Alex Smith',
      createdAt: '2024-02-15'
    },
    {
      id: '2',
      title: 'Kitchen Cabinet Handles',
      description: 'Set of 12 handmade bronze cabinet pulls',
      status: 'pending',
      sketch: '/api/placeholder/200/200',
      customerName: 'Sarah Johnson',
      createdAt: '2024-02-18'
    },
    {
      id: '3',
      title: 'Decorative Wall Mirror',
      description: 'Circular mirror with carved wooden frame',
      status: 'completed',
      sketch: '/api/placeholder/200/200',
      finalImage: '/api/placeholder/200/200',
      materialCost: 200,
      timeSpent: 8,
      payment: 450,
      customerName: 'Mike Brown',
      createdAt: '2024-02-10'
    }
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.status}>
          <div className={styles.statusItem}>
            <span className={styles.statusDot} data-status="pending"></span>
            <span>Pending</span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.statusDot} data-status="in-progress"></span>
            <span>In Progress</span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.statusDot} data-status="completed"></span>
            <span>Completed</span>
          </div>
        </div>
      </div>

      <div className={styles.queue}>
        {queueItems.map((item) => (
          <div key={item.id} className={styles.queueItem} data-status={item.status}>
            <div className={styles.itemHeader}>
              <h3 className={styles.itemTitle}>{item.title}</h3>
              <span className={styles.itemStatus} data-status={item.status}>
                {item.status}
              </span>
            </div>

            <p className={styles.itemDescription}>{item.description}</p>

            <div className={styles.itemImages}>
              {item.sketch && (
                <div className={styles.imageContainer}>
                  <span className={styles.imageLabel}>Sketch</span>
                  <img src={item.sketch} alt="Sketch" className={styles.image} />
                </div>
              )}
              {item.finalImage && (
                <div className={styles.imageContainer}>
                  <span className={styles.imageLabel}>Final</span>
                  <img src={item.finalImage} alt="Final piece" className={styles.image} />
                </div>
              )}
            </div>

            <div className={styles.itemDetails}>
              <span>Customer: {item.customerName}</span>
              <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
              {item.materialCost && <span>Materials: ${item.materialCost}</span>}
              {item.timeSpent && <span>Time: {item.timeSpent}h</span>}
              {item.payment && <span>Payment: ${item.payment}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}