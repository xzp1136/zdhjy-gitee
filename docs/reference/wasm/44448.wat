  (func (;44448;) (type 3) (param i32 i32 i32) (result i32)
    (local i32 i32 i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 4
    global.set 0
    i32.const 4367458
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3375560
      call 2180
      i32.const 3357344
      call 2180
      i32.const 3387112
      call 2180
      i32.const 3387116
      call 2180
      i32.const 3360788
      call 2180
      i32.const 4367458
      i32.const 1
      i32.store8
    end
    local.get 4
    i32.const 0
    i32.store offset=4
    loop  ;; label = @1
      i32.const 3357344
      i32.load
      local.tee 2
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 2
        call 60460
        i32.const 3357344
        i32.load
        local.set 2
      end
      local.get 2
      i32.load offset=92
      local.tee 3
      i32.load offset=4
      i32.load offset=12
      local.get 5
      i32.gt_s
      if  ;; label = @2
        local.get 0
        i32.load offset=48
        local.set 6
        local.get 2
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 2
          call 60460
          i32.const 3357344
          i32.load
          i32.load offset=92
          local.set 3
        end
        i32.const 3375560
        i32.load
        local.set 2
        local.get 4
        local.get 3
        i32.load offset=4
        local.get 5
        i32.const 2
        i32.shl
        i32.add
        i32.load offset=16
        i32.store offset=8
        block  ;; label = @3
          local.get 6
          local.get 4
          i32.const 8
          i32.add
          local.get 4
          i32.const 4
          i32.add
          local.get 2
          call 34286
          i32.eqz
          br_if 0 (;@3;)
          i32.const 0
          local.set 2
          local.get 4
          i32.load offset=4
          local.tee 3
          i32.load offset=12
          i32.const 0
          i32.le_s
          br_if 0 (;@3;)
          loop  ;; label = @4
            local.get 3
            local.get 2
            local.get 4
            i32.const 12
            i32.add
            i32.const 3387116
            i32.load
            call 50458
            local.get 4
            i32.load offset=12
            local.set 3
            i32.const 3360788
            i32.load
            local.tee 6
            i32.load offset=116
            i32.eqz
            if  ;; label = @5
              local.get 6
              call 60460
            end
            block  ;; label = @5
              local.get 3
              i32.const 0
              i32.const 0
              call 48872
              br_if 0 (;@5;)
              local.get 3
              i32.load8_u offset=96
              br_if 0 (;@5;)
              local.get 3
              i32.load8_u offset=108
              br_if 0 (;@5;)
              local.get 7
              local.get 3
              i32.load offset=56
              local.get 1
              i32.eq
              i32.add
              local.set 7
            end
            local.get 2
            i32.const 1
            i32.add
            local.tee 2
            local.get 4
            i32.load offset=4
            local.tee 3
            i32.load offset=12
            i32.lt_s
            br_if 0 (;@4;)
          end
        end
        local.get 5
        i32.const 1
        i32.add
        local.set 5
        br 1 (;@1;)
      end
    end
    local.get 4
    i32.const 16
    i32.add
    global.set 0
    local.get 7)
