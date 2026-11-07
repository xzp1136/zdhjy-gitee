  (func (;41006;) (type 3) (param i32 i32 i32) (result i32)
    (local i32 i32 i32)
    global.get 0
    i32.const 48
    i32.sub
    local.tee 4
    global.set 0
    i32.const 0
    local.set 2
    i32.const 4365108
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3356428
      call 2180
      i32.const 3413540
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3480932
      call 2180
      i32.const 4365108
      i32.const 1
      i32.store8
    end
    block  ;; label = @1
      local.get 1
      i32.load offset=8
      i32.const 0
      call 48223
      br_if 0 (;@1;)
      local.get 1
      local.get 1
      i32.load offset=8
      local.get 1
      call 41011
      local.set 2
      i32.const 3360788
      i32.load
      local.tee 3
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 3
        call 60460
      end
      local.get 2
      i32.const 0
      i32.const 0
      call 48872
      if  ;; label = @2
        i32.const 0
        local.set 2
        i32.const 3480932
        i32.load
        local.get 1
        i32.load offset=8
        i32.const 0
        call 48049
        local.set 1
        i32.const 3356428
        i32.load
        local.tee 0
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 0
          call 60460
        end
        local.get 1
        i32.const 0
        call 55218
        br 1 (;@1;)
      end
      i32.const 4367473
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3360844
        call 2180
        i32.const 4367473
        i32.const 1
        i32.store8
      end
      i32.const 3360844
      i32.load
      i32.load offset=92
      i32.load
      local.set 3
      i32.const 3360788
      i32.load
      local.tee 5
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 5
        call 60460
      end
      block (result i32)  ;; label = @2
        local.get 3
        i32.const 0
        i32.const 0
        call 48812
        if  ;; label = @3
          i32.const 4367473
          i32.load8_u
          i32.eqz
          if  ;; label = @4
            i32.const 3360844
            call 2180
            i32.const 4367473
            i32.const 1
            i32.store8
          end
          i32.const 3360844
          i32.load
          i32.load offset=92
          i32.load
          local.get 2
          local.get 0
          i32.const 0
          call 48735
          i32.const 5
          i32.const 0
          call 43865
          br 1 (;@2;)
        end
        local.get 0
        i32.const 0
        call 48735
        local.set 3
        i32.const 3360788
        i32.load
        local.tee 5
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 5
          call 60460
        end
        local.get 2
        local.get 3
        i32.const 3413540
        i32.load
        call 24532
      end
      local.set 3
      i32.const 0
      local.set 2
      i32.const 3360788
      i32.load
      local.tee 5
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 5
        call 60460
      end
      local.get 3
      i32.const 0
      i32.const 0
      call 48872
      br_if 0 (;@1;)
      local.get 3
      i32.const 0
      call 48828
      local.get 0
      i32.const 0
      call 48735
      i32.const 0
      i32.const 0
      call 49498
      local.get 3
      i32.const 0
      call 48828
      local.set 2
      local.get 4
      local.get 1
      i32.load offset=20
      i32.store offset=40
      local.get 4
      local.get 1
      i64.load offset=12 align=4
      i64.store offset=32
      local.get 2
      local.get 4
      i32.const 32
      i32.add
      i32.const 0
      call 49448
      local.get 3
      i32.const 0
      call 48828
      local.set 2
      local.get 4
      local.get 1
      i32.load offset=32
      i32.store offset=24
      local.get 4
      local.get 1
      i64.load offset=24 align=4
      i64.store offset=16
      local.get 2
      local.get 4
      i32.const 16
      i32.add
      i32.const 0
      call 49481
      local.get 3
      i32.const 0
      call 48828
      local.set 2
      local.get 4
      local.get 1
      i32.load offset=44
      i32.store offset=8
      local.get 4
      local.get 1
      i64.load offset=36 align=4
      i64.store
      local.get 2
      local.get 4
      i32.const 0
      call 49495
      local.get 3
      i32.const 1
      i32.const 0
      call 48833
      local.get 3
      local.set 2
    end
    local.get 4
    i32.const 48
    i32.add
    global.set 0
    local.get 2)
