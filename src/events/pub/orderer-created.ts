import { OrdererCreatedEvent } from 'common/types/events/orderer'
import { Publisher } from 'common/services/nats'
import { Subjects } from 'common/types/events'

class OrdererCreatedPub extends Publisher<OrdererCreatedEvent> {
	private static _instance: OrdererCreatedPub = new OrdererCreatedPub()

	readonly subject = Subjects.OrdererCreated

	static get instance() {
		return this._instance
	}
}

const instance = OrdererCreatedPub.instance
export { instance as orderer_created_pub }
