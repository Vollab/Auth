import { OrdererUpdatedEvent } from 'common/types/events/orderer'
import { Publisher } from 'common/services/nats'
import { Subjects } from 'common/types/events'

class OrdererUpdatedPub extends Publisher<OrdererUpdatedEvent> {
	private static _instance: OrdererUpdatedPub = new OrdererUpdatedPub()

	readonly subject = Subjects.OrdererUpdated

	static get instance() {
		return this._instance
	}
}

const instance = OrdererUpdatedPub.instance
export { instance as orderer_updated_pub }
