  (func (;43429;) (type 3) (param i32 i32 i32) (result i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 2
    global.set 0
    i32.const 4366736
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3376224
      call 2180
      i32.const 3376244
      call 2180
      i32.const 3376220
      call 2180
      i32.const 3376256
      call 2180
      i32.const 3346768
      call 2180
      i32.const 3388528
      call 2180
      i32.const 3388532
      call 2180
      i32.const 3360788
      call 2180
      i32.const 4366736
      i32.const 1
      i32.store8
    end
    local.get 2
    i32.const 0
    i32.store offset=4
    i32.const 3346768
    i32.load
    call 1900
    local.tee 6
    i32.const 3376220
    i32.load
    call 34422
    block  ;; label = @1
      local.get 0
      i32.load offset=16
      local.tee 3
      i32.load offset=12
      i32.const 0
      i32.le_s
      br_if 0 (;@1;)
      loop  ;; label = @2
        local.get 3
        local.get 8
        local.get 2
        i32.const 12
        i32.add
        i32.const 3388532
        i32.load
        call 50458
        local.get 2
        i32.load offset=12
        local.set 3
        i32.const 3360788
        i32.load
        local.tee 4
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 4
          call 60460
        end
        block  ;; label = @3
          local.get 3
          i32.const 0
          i32.const 0
          call 48872
          br_if 0 (;@3;)
          local.get 3
          i32.load8_u offset=77
          i32.eqz
          br_if 0 (;@3;)
          local.get 3
          i32.load8_u offset=76
          br_if 0 (;@3;)
          local.get 3
          i32.load8_u offset=129
          br_if 0 (;@3;)
          local.get 3
          i32.load offset=72
          local.set 5
          i32.const 4366773
          i32.load8_u
          i32.eqz
          if  ;; label = @4
            i32.const 3387256
            call 2180
            i32.const 3385828
            call 2180
            i32.const 3385832
            call 2180
            i32.const 4366773
            i32.const 1
            i32.store8
          end
          i32.const 0
          local.set 4
          block  ;; label = @4
            local.get 3
            i32.load offset=92
            local.tee 7
            i32.const 0
            i32.lt_s
            br_if 0 (;@4;)
            local.get 7
            local.get 3
            i32.load offset=56
            local.tee 9
            i32.load offset=12
            i32.ge_s
            br_if 0 (;@4;)
            local.get 9
            local.get 7
            local.get 2
            i32.const 12
            i32.add
            i32.const 3385832
            i32.load
            call 50458
            local.get 2
            i32.load offset=12
            i32.load offset=12
            local.set 4
          end
          local.get 5
          local.get 4
          local.get 3
          i32.load offset=100
          i32.add
          i32.sub
          local.tee 4
          i32.const 0
          i32.le_s
          br_if 0 (;@3;)
          i32.const 3376244
          i32.load
          local.set 5
          local.get 2
          local.get 3
          i32.load offset=68
          local.tee 3
          i32.store offset=12
          block  ;; label = @4
            local.get 6
            local.get 2
            i32.const 12
            i32.add
            local.get 2
            i32.const 4
            i32.add
            local.get 5
            call 34286
            if  ;; label = @5
              i32.const 3376256
              i32.load
              local.set 5
              local.get 2
              i32.load offset=4
              local.set 7
              local.get 2
              local.get 3
              i32.store offset=12
              local.get 2
              local.get 4
              local.get 7
              i32.add
              i32.store offset=8
              local.get 6
              local.get 2
              i32.const 12
              i32.add
              local.get 2
              i32.const 8
              i32.add
              local.get 5
              call 34436
              br 1 (;@4;)
            end
            i32.const 3376224
            i32.load
            local.set 5
            local.get 2
            local.get 3
            i32.store offset=12
            local.get 2
            local.get 4
            i32.store offset=8
            local.get 6
            local.get 2
            i32.const 12
            i32.add
            local.get 2
            i32.const 8
            i32.add
            local.get 5
            call 34391
          end
          local.get 10
          i32.const 1
          i32.add
          local.tee 10
          local.get 1
          i32.ge_s
          br_if 2 (;@1;)
        end
        local.get 8
        i32.const 1
        i32.add
        local.tee 8
        local.get 0
        i32.load offset=16
        local.tee 3
        i32.load offset=12
        i32.lt_s
        br_if 0 (;@2;)
      end
    end
    local.get 2
    i32.const 16
    i32.add
    global.set 0
    local.get 6)
