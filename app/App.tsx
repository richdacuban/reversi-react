import React from 'react';
import io from 'socket.io-client';

import { Nav } from './Nav';
import { Home } from './Home';
import { About } from './About';
import { Rules } from './Rules';
import { Name } from './Name';
import { Lobby } from './Lobby';
import { Chat } from './Chat';
import { Game } from './Game';

import { Constants, PageKey } from './AppConstants';

// import { PageKey, 
//          IGame, IPlayer, IBoardLocation, 
//          IChatMsg, IMove, ILobbyAction, IJoinRoom, ISendMessage, 
//          ISendMessageResponse, IServerDataResponse } from './AppInterfaces';

import './lib/reset.less';
import './App.less';

/** Overall application state structure... */
interface IAppState {
    ActivePage: PageKey;
    PlayerName: string;
    NewChatMsgVal: string;
    ChatMsgs: IChatMsg[];
    PlayerData: IPlayer[];
    GameData: IGame;
}

export class App extends React.Component<{}, IAppState> {

    private mSocket: SocketIOClient.Socket;

    constructor() {
        super();

        //Init Client Socket.IO...
        this.mSocket = io();

        //Handle web socket event for log...
        this.mSocket.on('log', (e: any): void => {
            console.log.apply(console, e);
        });

        //Handle web socket event for error responses...
        this.mSocket.on('error_response', (e: IServerDataResponse): void => {
            //Logging and Error Handling...
            console.log('error_response: ' + JSON.stringify(e));
            if (!e.IsOpSuccess && e.ActionName && e.Message) {
                alert(e.ActionName + ': ' + e.Message);
                return;
            }
        });

        //Handle web socket event for player or game updates (new player, player disconnect, game updates, etc)...
        this.mSocket.on('update_broadcast', (e: IServerDataResponse): void => {
            //Logging and Error Handling...
            console.log('update_broadcast: ' + JSON.stringify(e));
            this.UpdateAppStateFromServerData(e);
        });

        //Handle web socket response for send_message_broadcast...
        this.mSocket.on('send_message_broadcast', (e: ISendMessageResponse): void => {
            //Logging and Error Handling...
            console.log('send_message_broadcast: ' + JSON.stringify(e));
            if (e.IsOpSuccess) {
                //Update ChatMsgs...
                let _NewChatMsgs: IChatMsg[] = this.state.ChatMsgs.slice();
                if (e.Message && e.Message !== '') {
                    _NewChatMsgs.push({ Username: e.Username, Message: e.Message, AddedOn: new Date() });
                }

                //Update State...
                if (e.Username === this.state.PlayerName) {
                    //Update NewChatMsgVal to '' if the message received is from the current/active player...
                    this.setState({
                        NewChatMsgVal: '',
                        ChatMsgs: _NewChatMsgs
                    });
                }
                else {
                    this.setState({
                        ChatMsgs: _NewChatMsgs
                    });
                }
            }
        });
    }

    //Set initial App state...
    state = {
        ActivePage: PageKey.Home,
        PlayerName: '',
        NewChatMsgVal: '',
        ChatMsgs: [],
        PlayerData: []
    } as IAppState;

    //Get the active Player using the PlayerName from the AppState...
    public GetActivePlayer = () => {
        return this.GetActivePlayerFromPlayerArray(this.state.PlayerData);
    }

    //Get the active Player using the PlayerName from the AppState...
    public GetActivePlayerFromPlayerArray = (_PlayerData: IPlayer[]) => {
        return _PlayerData.find(_Player => _Player.Username === this.state.PlayerName);
    }

    //Get Player by SocketID...
    public GetPlayerBySocketID = (_SocketID: string) => {
        return this.state.PlayerData.find(_Player => _Player.SocketID === _SocketID);
    }

    private EmitLobbyAction = (_LobbyAction: ILobbyAction) => {
        console.log(_LobbyAction.ActionName + ' ' + _LobbyAction.SourceSocketID + '->' + _LobbyAction.TargetSocketID);
        this.mSocket.emit('lobby_action', _LobbyAction);
    }

    //Updates application state based on new data from the server...
    private UpdateAppStateFromServerData = (e: IServerDataResponse) => {
        if (!e.IsOpSuccess) {
            alert(e.Message);
            return;
        }

        //Update ChatMsgs...
        let _NewChatMsgs: IChatMsg[] = this.state.ChatMsgs.slice();
        if (e.Message && e.Message !== '') {
            _NewChatMsgs.push({ Username: 'SYSTEM', Message: e.Message, AddedOn: new Date() });
        }

        //Get the Active Player and Current Active PageKey...
        let _ActivePlayer = this.GetActivePlayerFromPlayerArray(e.PlayerData);
        let _CurrPageKey = this.state.ActivePage;

        //If the ActivePlayer isn't in the Lobby, then go to the Game "page"...
        if (_ActivePlayer.CurrRoomName && _ActivePlayer.CurrRoomName !== Constants.LOBBYROOMNAME) {
            _CurrPageKey = PageKey.Game;
        }

        //Update State...
        this.setState({
            ActivePage: _CurrPageKey,
            ChatMsgs: _NewChatMsgs,
            PlayerData: e.PlayerData,
            GameData: e.GameData
        });

        if (_ActivePlayer.NextRoomName !== '') {
            let _JoinPayload: IJoinRoom = { RoomName: _ActivePlayer.NextRoomName, Username: this.state.PlayerName };
            console.log('JoinPayload: ' + JSON.stringify(_JoinPayload));
            this.mSocket.emit('join_room', _JoinPayload);
        }
    }

    //Nav Component Handler(s)...
    private handleNavAction = (pageKey: PageKey) => {
        if (this.state.ActivePage !== pageKey) {
            this.setState({
                ActivePage: pageKey
            });
        }
    }

    //Name Component Handler(s)...
    private handleNameSubmitEvent = (Name: string) => {
        if (Name == null || Name === '')
            Name = 'Anonymous' + Math.floor(Math.random() * 10000);

        let _JoinPayload: IJoinRoom = { RoomName: Constants.LOBBYROOMNAME, Username: Name };
        console.log('JoinPayload: ' + JSON.stringify(_JoinPayload));
        this.mSocket.emit('join_room', _JoinPayload);

        this.setState({
            ActivePage: PageKey.Lobby,
            PlayerName: Name
        });
    }

    //Lobby Component Handler(s)...
    private handleLobbyInvite = (e: React.FormEvent<HTMLButtonElement>) => {
        let _Payload: ILobbyAction = { ActionName: 'invite', SourceSocketID: this.GetActivePlayer().SocketID, TargetSocketID: e.currentTarget.value };
        this.EmitLobbyAction(_Payload);
    }

    private handleLobbyUninvite = (e: React.FormEvent<HTMLButtonElement>) => {
        let _Payload: ILobbyAction = { ActionName: 'uninvite', SourceSocketID: this.GetActivePlayer().SocketID, TargetSocketID: e.currentTarget.value };
        this.EmitLobbyAction(_Payload);
    }

    private handleLobbyPlay = (e: React.FormEvent<HTMLButtonElement>) => {
        let _Payload: ILobbyAction = { ActionName: 'play', SourceSocketID: this.GetActivePlayer().SocketID, TargetSocketID: e.currentTarget.value };
        this.EmitLobbyAction(_Payload);
    }

    //Game Component Handler(s)...
    private handleGamePlay = (BoardSize: number) => {
        this.mSocket.emit('replay', { BoardSize: BoardSize });
    }

    private handleGameQuit = (e: React.FormEvent<HTMLButtonElement>) => {

        var _GameData = this.state.GameData;

        let _Payload: IJoinRoom = { RoomName: Constants.LOBBYROOMNAME, Username: this.state.PlayerName };
        console.log('JoinRoom: ' + JSON.stringify(_Payload));
        this.mSocket.emit('join_room', _Payload);

        this.setState({
            ActivePage: PageKey.Lobby,
            GameData: _GameData
        });
    }

    //GameSquare Component Handler(s)...
    private handleGameSquareClick = (BoardLocation: IBoardLocation, CurrTurn: number) => {
        let _Payload: IMove = { X: BoardLocation.X, Y: BoardLocation.Y, CurrTurn: CurrTurn };
        console.log('TryMove: ' + JSON.stringify(_Payload));
        this.mSocket.emit('try_move', _Payload);
    }

    //Chat Component Handler(s)...
    private handleChatMsgSubmitEvent = (Message: string) => {
        let _ChatPayload: ISendMessage = { RoomName: Constants.LOBBYROOMNAME, Username: this.state.PlayerName, Message: Message };
        console.log('ChatPayload: ' + JSON.stringify(_ChatPayload));
        this.mSocket.emit('send_message', _ChatPayload);
    }

    //Main App render() method...
    render() {
        const { ActivePage } = this.state;

        //Get the correct "Page" Component to return for the App's main render() method.
        const renderPageComponent = (pageKey: PageKey) => {
            switch (pageKey) {
                case PageKey.About:
                    return <About onNavigate={this.handleNavAction} />;

                case PageKey.Rules:
                    return <Rules onNavigate={this.handleNavAction} />;

                case PageKey.Name:
                    return <Name onNavigate={this.handleNavAction}
                        onNameSubmit={this.handleNameSubmitEvent}
                        PlayerName={this.state.PlayerName} />;

                case PageKey.Lobby:
                    return <div id="LobbyChat">
                        <Lobby onNavigate={this.handleNavAction}
                            onInvite={this.handleLobbyInvite}
                            onUninvite={this.handleLobbyUninvite}
                            onPlay={this.handleLobbyPlay}
                            GetActivePlayer={this.GetActivePlayer}
                            LobbyRoomName={Constants.LOBBYROOMNAME}
                            PlayerName={this.state.PlayerName}
                            PlayerData={this.state.PlayerData} />
                        <Chat onNavigate={this.handleNavAction}
                            onMsgSubmit={this.handleChatMsgSubmitEvent}
                            PlayerName={this.state.PlayerName}
                            NewChatMsgVal={this.state.NewChatMsgVal}
                            ChatMsgs={this.state.ChatMsgs} />
                    </div>;

                case PageKey.Game:
                    return <div id="GameChat">
                        <Game onNavigate={this.handleNavAction}
                            onReplay={this.handleGamePlay}
                            onQuit={this.handleGameQuit}
                            onGameSquareClick={this.handleGameSquareClick}
                            ActivePlayer={this.GetActivePlayer()}
                            GameData={this.state.GameData} />
                        <Chat onNavigate={this.handleNavAction}
                            onMsgSubmit={this.handleChatMsgSubmitEvent}
                            PlayerName={this.state.PlayerName}
                            NewChatMsgVal={this.state.NewChatMsgVal}
                            ChatMsgs={this.state.ChatMsgs} />
                    </div>;

                default:
                    return <Home onNavigate={this.handleNavAction} />;
            }
        };

        return (
            <div className="container App App-addrowspacing">
                <header>
                    <Nav ActivePage={ActivePage} onNavigate={this.handleNavAction} />
                </header>
                <main>
                    {renderPageComponent(ActivePage)}
                </main>
                <footer>
                    <div className="row text-center">
                        <div className="col">
                            <span>
                                By <a href="http://aaronsoto.com" target="_blank">Aaron Soto</a><br />
                                For <a href="http://mhcid.ics.uci.edu/" target="_blank">UC Irvine's MHCID Program</a><br />
                                <a href="https://github.com/deztech/reversi-react" target="_blank">GitHub Repo</a> | <a href="https://youtu.be/Ija5idXFoGQ" target="_blank">YouTube Demo</a> | <a href="/serverdata.json" target="_blank">Server Data (JSON)</a>
                            </span>
                        </div>
                    </div>
                </footer>
            </div>
        );
    }
}