import { CandidateCreatedEvent } from 'common/types/events/candidate'
import { Publisher } from 'common/services/nats'
import { Subjects } from 'common/types/events'

class CandidateCreatedPub extends Publisher<CandidateCreatedEvent> {
	private static _instance: CandidateCreatedPub = new CandidateCreatedPub()

	readonly subject = Subjects.CandidateCreated

	static get instance() {
		return this._instance
	}
}

const instance = CandidateCreatedPub.instance
export { instance as candidate_created_pub }
