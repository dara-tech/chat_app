import getConversationById from "@/app/actions/getConversationById";
import getMessages from "@/app/actions/getMessages";
import EmptyState from "@/app/components/EmptyState";
import Header from "./components/Header";
import Body from "./components/Body";
import Form from "./components/Form";

interface IParams {
  conversationId: string;
}

const ConversationPage = async ({ params }: { params: Promise<IParams> }) => {
  const { conversationId } = await params;
  const conversation = await getConversationById(conversationId);
  const messages = await getMessages(conversationId);

  if (!conversation) {
    return (
      <div className="lg:pl-80 h-full">
        <div className="h-full flex flex-col">
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="lg:pl-80 h-screen">
      {/* Flex container */}
      <div className="h-full flex flex-col border-l-[1px] border-gray-100">
        {/* Header at the top */}
        <Header conversation={conversation} />

        {/* Body takes remaining space */}
        <div className="flex-grow overflow-y-auto">
          {/* Pass messages to Body component */}
          <Body initialMessages={messages} />
        </div>

        {/* Form at the bottom */}
        <div>
          <Form />
        </div>
      </div>
    </div>
  );
};

export default ConversationPage;
